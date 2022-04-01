import axios from "axios"

export const login = async (email, password) => {

    try {

        const res = await axios({
            method: 'post',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        });

        if(res.data.status === 'success'){
            location.assign('/')
        }

    } catch (error) {
        alert(error);
    }
}

export const logout = async () => {

    try {

        const res = await axios({
            method: 'get',
            url: '/api/v1/users/logout',
            data: {
                
            }
        });

        if(res.data.status === 'success'){
            location.reload(true)
        }

    } catch (error) {
        alert(error);
    }
}