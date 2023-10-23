var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();

    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    let drawPolygon = (polygon) => {
        let c2 = canvas.getContext('2d');
        c2.fillStyle = '#ffa4a4';
        c2.beginPath();
        c2.moveTo(polygon[0].x, polygon[0].y);
        for(let i = 1; i < polygon.length; i++) {
            c2.lineTo(polygon[i].x,polygon[i].y);
        }
        c2.closePath();
        c2.fill();
    }


    //var connectAndSubscribe = function () {
    var connectAndSubscribe = function (callbackPoint, callbackPolygon, val) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe(`/topic/newpoint.${val}`, function (eventbody) {
                let theObject=JSON.parse(eventbody.body);
                callbackPoint(theObject);
            });
            stompClient.subscribe(`/topic/newpolygon.${val}`, function (eventbody) {
                let theObject=JSON.parse(eventbody.body);
                callbackPolygon(theObject);
            });
        });

    };
    
    

    return {

        connect: function (val) {
            var can = document.getElementById("canvas");
            
            //websocket connection
            connectAndSubscribe(addPointToCanvas, drawPolygon, val);
        },

        publishPoint: function(px,py,val){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            //addPointToCanvas(pt);

            //publicar el evento
            stompClient.send(`/app/newpoint.${val}`, {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();