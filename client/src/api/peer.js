const peer = new RTCPeerConnection({
    iceServers: [
        {
            urls: "stun:stun.stunprotocol.org"
        }
    ]
});

peer.onicecandidate = (event) => {
    console.log('ICE candidate event:', event);
};

peer.onconnectionstatechange = () => {
    console.log('Connection state change:', peer.connectionState);
};

peer.onsignalingstatechange = () => {
    console.log('Signaling state change:', peer.signalingState);
};

export default peer;

