exports.hideIp = (ip) => {
    const octects = ip.split(".");
    if(octects.length !== 4) return ip; //only IPv4 handled

    //Mask last two octets
    return `${octects[0]}.***.***.***`;
}