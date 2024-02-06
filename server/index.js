const http = require("http")
const {Server} = require("socket.io")

const PORT = 8080

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors :{
    origin: "http://localhost:3000",
    methods: ["GET","POST"]
  }
});

io.on("connection", (socket) => {
    socket.on("join-room", ( room, cb ) => {
        socket.join( room )
        console.log( socket.id + " connected to " + room )
        if( cb ) cb()

        const handleLeave = () => {
            console.log( socket.id + " disconnected from " + room )
            socket.to(room).emit( "reciever-exit", {})
        }

        socket.on("disconnect", handleLeave )
        socket.on("exit-room", handleLeave )
    })
    
    
    socket.on("file-meta", ( data, room ) => {
        console.log( "file meta in " + room)
        socket.to( room ).emit( "file-meta", data )
    })
    socket.on("file-share", ( data, room )  => {
        console.log( "file share in " + room)
        socket.to( room ).emit( "file-share", data )
    })
    socket.on("file-raw", ( data, room ) => {
        console.log( "file raw in " + room)
        socket.to( room ).emit( "file-raw", data )
    })
});

httpServer.listen( PORT );


