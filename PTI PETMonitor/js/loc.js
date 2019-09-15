//Variaveis global
var alertasound = true //controle do alerta true = ativa
var pLat = 0; //Variavel Latitude pet
var pLng = 0; //Variavel Longitude pet
var mapZoom = 18; //Zoom aplicado no mapa
var markersArray =[];//Variavel documentação https://developers.google.com/maps/documentation/javascript/markers

//Inicializa API geoLocalization do google
//documentação API https://developers.google.com/maps/documentation/javascript/geolocation
function givLoc(x) {
    try{
//Utilizado para capturar a posição atual do dispositivo.
//Será chamada automáticamente  cada vez que a posição no dispositivo mudar.
//Caso navegador não suporte sera chamada função de error "errorCallback".
		options = {
		  enableHighAccuracy: false,//habilitar alta precisão
		  timeout: 5000,//Tempo maximo em milesegundo para obter localização
		  maximumAge: 0// tempo maximo que disposivo ira amarzezar posição em cache
		};
        getId = navigator.geolocation.watchPosition(getPos,errorCallback,options);
    }catch(e){
        console.error("Não foi possivel inicializar a geolocalização: "+e);
    }
}

function getPos(pos){
	try {
		console.clear();//Limpa console

//Pega loclização do tutor	
		var tLat = pos.coords.latitude;
		var tLng = pos.coords.longitude;

//Gera loalização fictia do pet
//Verifica se ja foi gerada uma localização para o pet
	    if(pLat == 0 || pLng == 0){

//Se não Gera uma cordenada ficticia utilizando as cordenadas o tutor para calcular,        
			pLat = parseFloat((tLat +Math.floor(Math.random()* 9999) *0.00000005).toFixed(7));
			pLng = parseFloat((tLng +Math.floor(Math.random()* 9999) *0.00000005).toFixed(7));
		}else{
//Se a cordenada estiver gerada, gera nova cordenada com base na antiga
//Gera valor negatico ou positivo
			if((Math.floor(Math.random()* 2) *1) == 1){var m = '1';}else{var m ='-1';}

			pLat = parseFloat((pLat +(Math.floor(Math.random()* 999) *0.00000006)*m).toFixed(7));
			pLng = parseFloat((pLng +(Math.floor(Math.random()* 999) *0.00000006)*m).toFixed(7));
	    }
	   	console.log('Tutor e Pet Localizado');

//Calcula distancia entre Tutor e Pet
		cDist = calcDist(tLat,tLng,pLat,pLng);
		console.log('Distancia Calculada');

//Verifica se o boxShadow e mapa foi carregado
		if(document.getElementById('shadow-popup') == null){

//Se não foi é criado
			if(createBox() == true){
				console.log('Box mapa criado');
//Apos criar insere informações
				insertInfo(tLat,tLng,pLat,pLng,cDist);
				creatMark(tLat,tLng,pLat,pLng,map);
				if(insertInfo){
 					ranger();
 				}	
			}
		}else{
//Se boxShadow e mapa já foi criado atualiza informações
			var itInfo = insertInfo(tLat,tLng,pLat,pLng,cDist);
 			creatMark(tLat,tLng,pLat,pLng,map);
 			if(insertInfo){
 				ranger();
 			}

		}
	} catch(e) {
		console.log('Falha ao gerar localização: '+e);
	}
}

function calcDist(tLat,tLng,pLat,pLng){
//calcula distancia entre pet e tutor
//codigo do calculo retirado:
//http://carlosdelfino.eti.br/cursoarduino/geoprocessamento/calculando-distancias-com-base-em-coordenadas-de-gps/
    try{
        d2r = 0.017453292519943295769236;

        dlong = (pLng - tLng) * d2r;
        dlat = (pLat - tLat) * d2r;

        temp_sin = Math.sin(dlat/2.0);
        temp_cos = Math.cos(tLat * d2r);
        temp_sin2 = Math.sin(dlong/2.0);

        a = (temp_sin * temp_sin) + (temp_cos * temp_cos) * (temp_sin2 * temp_sin2);
        c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));

//Resultado da distancia
        return parseInt((6368.1 * c)*1000);
    }catch(e){
        console.error('Falha ao calcular a distancia: '+e);
    }
}

function convertData(data){
	try {
	    var dia     = '00'+data.getDate();           // 1-31
	    var mes     = data.getMonth();          // 0-11 (zero=janeiro)
	    var ano4    = data.getFullYear();       // 4 dígitos
	    var hora    = '00'+data.getHours();          // 0-23
	    var min     = '00'+data.getMinutes();        // 0-59
	    var str_data = dia.slice(-2)+'/'+('00'+(mes+1)).slice(-2)+'/'+ano4+' - '+hora.slice(-2)+':'+ min.slice(-2);

	    return str_data;
	} catch(e) {
		console.error('Falha ao converter data: '+e);
	}
}

function createBox(){
	try {
		var sPopup = document.createElement('div');//Cria elemento Div
		sPopup.id = 'shadow-popup';// Atribui Id para DIv criada
		document.body.appendChild(sPopup);//Adiciona Div ao Body
		var boxShadow = document.getElementById('shadow-popup');

		document.body.style.overflow = 'hidden';// Ocuta barra de rolagem
		window.scrollTo(0, 0);//Posiciona navegador no topo da pagina;

		//Criando cantainer do main
		var boxMain = document.createElement('main');//cria elemento article
		boxShadow.appendChild(boxMain);//imprime article dentro da section boxMain
		var boxMain = boxShadow.querySelector('main');

		//Criando cantainer do mapa
		var boxMap = document.createElement('div');//cria elemento article
		boxMap.id = 'map';//Atribui ao elemento article id 'map'
		boxMain.appendChild(boxMap);//imprime article dentro da section boxMain
		var boxMap = document.getElementById('map');
		
		//Criando cantainer da logo
		var boxLogo = document.createElement('span');//cria elemento span
		boxLogo.className = 'logo';//Atribui ao elemento article id 'map'
		boxLogo.textContent = 'PETMonitor';
		boxMain.appendChild(boxLogo);//imprime article dentro da section boxMain

		//Criando cantainer das cordenadas
		var boxInfo = document.createElement('aside');//cria elemento aside
		boxInfo.className = 'boxInfo';//Atribui ao elemento aside id 'cord'
		boxMain.appendChild(boxInfo);//imprime aside dentro da article boxMain
		var boxInfo = boxMain.getElementsByClassName('boxInfo');

		if(boxInfo.length != 0){
		//Insere mapa apos carregar o elemento boxInfo		
			insertMap(pLat,pLng);
		}

		//cria lista com as informações
		var ulInfo = document.createElement('ul');//cria elemento ul
		ulInfo.id = 'ulInfo';

		boxInfo[0].appendChild(ulInfo);//imprime ul dentro da aside boxInfo
		var ulInfo = document.getElementById('ulInfo');

		//cria 5 linhas (LI) dentro da ul
		for (var i = 0; i <= 3; i++) {
			var liInfo =document.createElement('li');//cria elemento li
			ulInfo.appendChild(liInfo)[i];
		}

		//identificando as linhas
		var liInfo = ulInfo.children;

		var inputRange = liInfo[0].id = 'range';
		var valueRange = liInfo[1].id = 'vrange';
		var valueAtt = liInfo[2].id = 'att';
		var valueDist = liInfo[3].id = 'distPet';

		//cria botão fechar
		var boxClose = document.createElement('div');//cria elemento aside
		boxClose.id = 'popup_close';//Atribui ao elemento aside id 'cord'
		boxClose.setAttribute('onclick', 'closePopup()')
		boxMain.appendChild(boxClose);//imprime aside dentro da article boxMain
		var boxClose = boxMain.getElementsByClassName('boxClose');


		return true;
	} catch(e) {
		console.log('Falha ao criar Box: '+e);
	}
}

function insertMap(pLat,pLng){
	try {
			var pCord = {lat: pLat,lng: pLng};
//cria cria mapa centralizado nas cordenadas do Pet
    		map = new google.maps.Map(document.getElementById('map'), {
    		zoom: mapZoom,//Zoom do mapa
       		center: pCord,//Cordenadas para centralização do mapa
        	mapTypeId: 'roadmap',//mapa padrão da google
        	mapTypeControl: false,//Desabilita contrle de tipo de mapas
        	fullscreenControl: false// Desabilita botão de fullScreen
    	});
    } catch(e) {
		console.log('Falha ao inserir mapa: '+e);
	}
}

function creatMark(tLat,tLng,pLat,pLng,map){
//Documentação referente aos marcadores
//https://developers.google.com/maps/documentation/javascript/markers
    try {
//Limpa todos marcadores    
		clearMark();//Limpa marcaores
//Prepara variavel com as coordenadas do tutor
		var tCord = {lat: tLat, lng: tLng};
// prepara vaiavel com as coordenadas do pet
        var pCord = {lat: pLat,lng: pLng};
// prepara informações para exibir no mapa
    var iTutor  = "Você \n Lat: "+ tLat + "\n Long: "+ tLng;
    var iPet = nomepet+" ("+raca+")\n Lat: "+ pLat + "\n Long: "+ pLng;
//cria marcador do tutor    
        var marker = new google.maps.Marker({
            position: tCord,//cordenadas do Tutor 
            map: map,// Mapa aonde sera inserido
            label: 'T',//indentificação
            title: iTutor,//Informações 
        });
        markersArray.push(marker);
//cria marcador do Pet
        var marker = new google.maps.Marker({
            position: pCord,//cordenadas do Pet 
            map: map,// Mapa aonde sera inserido
            label: 'P',//indentificação
            title: iPet,//Informações 
        });
       markersArray.push(marker);
       google.maps.event.addListener(marker,"click",function(){});

       console.log('Marcadores gerado com sucesso');
    } catch(e) {
        console.error('Falha ao gerar marcadores: '+e);
    }     
}

function clearMark() {
    try {
    	//conta quantos marcadores tem no mapa
        for (var i = 0; i < markersArray.length; i++ ) {
        	//remove os marcadores
            markersArray[i].setMap(null);
        }
        markersArray.length = 0;
    } catch(e) {
        console.error('Falha ao limpar marcadore: '+e);
    }
}

function insertInfo(tLat,tLng,pLat,pLng,cDist){
	try {
		var Range = document.getElementById('range');
		var vRange = document.getElementById('vrange');
		var Att = document.getElementById('att');
		var Dist = document.getElementById('distPet');

		if(range.querySelector('input') == null){
			var inputRange = document.createElement('input')//cria input
			//Insere atributos no input
			inputRange.id = 'iRange';
			inputRange.setAttribute('type', 'range');
			inputRange.setAttribute('value', '20');
			inputRange.setAttribute('min', '0');
			inputRange.setAttribute('max', '100');
			inputRange.setAttribute('step', '10');
			inputRange.setAttribute('onchange','ranger()');
			range.appendChild(inputRange);//Adiciona input dentro do elemento li#range
		}
		var iRange = document.getElementById('iRange').value;
		var ulInfo = document.getElementById('ulInfo');

		//limpa as linhas dentro la lista ulInfo e insere novos valores
		for (var i = 1; i <= 3; i++) {
			if(i == 1){var text = iRange+' mt';}//Mostra valor do input range na tela
			if(i == 2){var text = convertData(new Date());}//MOstra data da atualização das cordenadas
			if(i == 3){var text = cDist+' mt';}//Mostra distancia entre pet e tutor
			ulInfo.children[i].textContent = text;		
		}
		redPag();
	} catch(e) {
		console.log('Falha ao inserir as informações: '+e);
	}
}

//Menssagem de erro caso navegador não suporte geolocalização
function errorCallback(error) {
    console.error('Error ao carregar geolocalização');
}

function ranger(){
    try {
//Pega valor de segurança do input range        
        vrange = document.getElementById('iRange').value;//pega valor do input range
//Se valor igual "0" range fica off
        if(vrange == 0){var segrang = 'Off';}else{var segrang = vrange+' mt';}
        document.getElementById('vrange').innerHTML = segrang;//Imprime valor
        seguro();
    } catch(e) {
        // statements
        console.error('Range: '+ e);
    }
}

function seguro(){
	try {
		var dist = document.getElementById('distPet');
	//Compara distancia do pet com distancia segura
	//Se pet estiver fora muda cor do texto e emite um alerta
		if((cDist > vrange)&&(vrange !=0)){
			dist.style.color = '#F00';
			dist.innerHTML = "<img src='img/alerta.gif' height='35px'><span>"+ cDist+" mt</span> <button id='mute' onclick='alerta()'></button>";

			alertasound = true;
	        alerta('play');//Se não emite sinal de alerta	
		}else{
			dist.style.color = '#000';
			dist.innerHTML = cDist+" mt";

			alerta('pause');
		}
	} catch(e) {
		console.error('Falha ao verificar distancia segura: '+e);
	}
}

function alerta(x){
    try {
//Pausa o som de alerta      
        if((x == 'pause')||(x == undefined && alertasound == true)){
            const audio = document.querySelector('audio');
            audio.pause();
            alertasound = false;

        }else if ((x == undefined && alertasound == false)) {
        	alertasound = true;
        }
//Emite som de alerta        
        if (x == 'play') {
            const audio = document.querySelector('audio');
            audio.play();
        }
//Alter botão alerta para on/off
    } catch(e) {
        console.error('Falha ao gerar alerta: '+e);
    }

}
function redPag(){
	try {
		var boxShadow = document.getElementById('shadow-popup');
		var boxMain = boxShadow.querySelector('main');
		var boxMap = document.getElementById('map');
		var boxInfo = boxShadow.getElementsByClassName('boxInfo');

		//Adiciona altura para contaner mada altura do boxMain - altura da BoxInfo
		boxMap.style.height = boxMain.offsetHeight - boxInfo[0].offsetHeight+'px';
	} catch(e) {
		console.error('Falha ao redimencinar pagina: '+e);
	}
}

function closePopup(){
	try {
		var sShadow = document.getElementById('shadow-popup');
		document.body.style.overflowY = 'visible';
		alerta('pause');//Paura o som de alerta
		navigator.geolocation.clearWatch(getId);//Para a atualização da navegação
		document.body.removeChild(sShadow);//remove o popup 
} catch(e) {
		console.error('Falha ao fechar Pop-up: '+e);
	}
}