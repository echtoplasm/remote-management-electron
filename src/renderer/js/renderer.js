const testWebSockets = async(event, data) => {
    try{
        const result = await window.electronAPI.websocket.webSocketConnect('test data');
        console.log('Websocket result', result)
    }catch(err){
        console.error('Websocket error', err.message)
    }
}

testWebSockets();


