import axios from "axios"

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
    // console.log(data);
    try {
        const url = type ==='password'
        ? 'http://localhost:3000/api/v1/users/updateMyPassword'
        : 'http://localhost:3000/api/v1/users/updateMe'

        console.log(data);

        const res = await axios({
            method: 'patch',
            url,
            data
        })

        if(res.data.status === 'success'){
            alert(`${type.toUpperCase()} Updated Successfully`)
        }

    } catch (error) {
        alert(error);
    }
}