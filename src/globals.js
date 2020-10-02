import axios from "axios";

const isAdmin = () => {
    try {
        return JSON.parse(atob(localStorage.getItem('token').split(".")[1])).admin;
    } catch (e) {
        return false;
    }
}

const isUser = () => {
    try {
        return !JSON.parse(atob(localStorage.getItem('token').split(".")[1])).admin;
    } catch (e) {
        return false;
    }
}

const isLoggedIn = () => {
    try {
        return isAdmin() || isUser();
    } catch (e) {
        return false;
    }
}

const getEmail = () => {
    return isLoggedIn() ? JSON.parse(atob(localStorage.getItem('token').split(".")[1])).email : "";
}

const flagRank = (contestInfo, currentTime) => {
    let ct = new Date(currentTime);
    let st = new Date(contestInfo.startTime);
    let et = new Date(contestInfo.endTime);
    let isFlag = false, isRanklist = false, msg, phase;
    if(st > ct) {
        msg = "Contest has not started yet";
        phase = 1;
    } else if(st < ct && et > ct) {
        isRanklist = true;
        isFlag = true;
        msg = "Contest is ongoing";
        phase = 2;
        if(!(contestInfo.rankList.show && (!contestInfo.rankList.automaticHide || (contestInfo.rankList.automaticHide && new Date(contestInfo.rankList.timeOfHide) > ct)))) {
            isRanklist = false;
            msg += ", ranklist is hidden / not enabled";
        }
    } else if(et < ct) {
        msg = "Contest has already ended";
        phase = 3;
    }
    return {isFlag, isRanklist, msg, phase}
}

const logout = (socket) => {
    setTimeout(() => { }, 1500);
    socket.disconnect();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('contestInfo');
};

export const configs = {
    baseUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '',
    isAdmin,
    isLoggedIn,
    isUser,
    getEmail,
    flagRank,
    logout
}

axios.interceptors.request.use(req => {
    if(localStorage.getItem('token'))
        req.headers = {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    req.validateStatus = status => {
        return status >= 200 && status < 505;
    }
    return req;
},err => {});