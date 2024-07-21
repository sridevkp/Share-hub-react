const http = require("http")
const {Server} = require("socket.io")

const PORT = 8080

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors :{
    origin: "http://localhost:5173",
    methods: ["GET","POST"]
  }
});

const users = new Map();


function handleLeave(){
    console.log( `${this.id} disconnected`)
    this.broadcast.emit( "reciever-exit", {})
    users.delete(this.id)
}

io.on("connection", (socket) => {
    users.set(socket.id, socket.id);

    socket.on("get:id", cb => {
        cb && cb( socket.id )
    })

    socket.on('outgoing:offer', data => {
        const { fromOffer, to } = data;
        if( !users.get(to) ) return ;
        socket.to(to).emit('incomming:offer', { from: socket.id, offer: fromOffer });
   });

    socket.on('offer:accepted', data => {
        const { answere, to } = data;
        socket.to(to).emit('incomming:answer', { from: socket.id, offer: answere })
    });

    socket.on('disconnect', handleLeave );
});

httpServer.listen( PORT );


