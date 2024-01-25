import userService from '../services/userService'
let handleLogin = async(req,res) =>{
    let email= req.body.email;
    let password= req.body.password;
    //các bước của server khi client gửi thông tin cho:
    // 1, check xem email của user có tồn tại hay ko
    //2, so sánh password của người dùng khi email gửi về đã tồn tại trong hệ thống
    //3, trả thêm access_token:JWT:json web token
    if(!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter!(banj đã nhập thiếu email or mật khẩu',

        })
    }

    let userData = await userService.hanldeUserLogin(email, password)
    return res.status(200).json({   //với api thì viết  trả về :res.status(...).json()
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : {}
    })
}

let handleGetAllUsers = async (req, res) =>{
    let id = req.query.id;
    let users = await userService.getAllUsers(id);
    if(!id){
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameter',
            users:[]
        })
    }
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        users
    })
}

let handleCreateNewUser = async(req, res) => {
    let message = await userService.createNewUser(req.body);
    // console.log(message);
    return res.status(200).json(message);
}

let handleDeleteUser = async(req, res)=>{
    if(!req.body.id){
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameter!',
        })
    }
    let message = await userService.deleteUser(req.body.id);
    return res.status(200).json(message);
}

let handleEditUser = async(req, res)=>{
    let data = req.body;
    let message = await userService.updateUser(data);
    return res.status(200).json(message);
}
module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleDeleteUser: handleDeleteUser,
    handleEditUser: handleEditUser,
}