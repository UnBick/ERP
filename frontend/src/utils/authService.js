class AuthService {
    static getToken() {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    }

    static setToken(token, remember = false) {
        if (remember) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }
    }

    static removeToken() {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
    }

    static isAuthenticated() {
        return !!this.getToken();
    }
}

export default AuthService;
