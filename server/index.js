const http = require("http");
const {Server} = require("socket.io");

const PORT = 8080 ;

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors :{
    origin: "https://share-hub-eight.vercel.app",
    methods: ["GET","POST"]
  }
});

const users = new Map();


function handleLeave(){
    console.log( `${this.id} disconnected`)
    this.broadcast.emit( 'reciever-exit', {})
    users.delete(this.id)
}

io.on('connection', (socket) => {
    console.log( `${socket.id} connected`)
    users.set(socket.id, socket.id);

    socket.on('id:self', cb => {
        cb && cb( socket.id )
    })

    socket.on('id:sender', to => {
        socket.to(to).emit('id:receiver', socket.id );
    })

    socket.on('outgoing:offer', data => {
        console.log( `${socket.id} offering`)
        const { fromOffer, to } = data;
        if( !users.get(to) ) return ;
        socket.to(to).emit('incomming:offer', { from: socket.id, offer: fromOffer });
   });

    socket.on('offer:accepted', data => {
        console.log( `${socket.id} accepting`)
        const { answer, to } = data;
        socket.to(to).emit('incomming:answer', { from: socket.id, offer: answer })
    });

    socket.on('send:candidate', data => {
        console.log( `${socket.id} sending candidate`)
        const { to, candidate } = data
        socket.to(to).emit('receive:candidate', { from : socket.id, candidate })
    })

    socket.on('disconnect', handleLeave );
});

httpServer.listen( PORT );


