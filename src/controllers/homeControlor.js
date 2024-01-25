import db from '../models/index';
import CRUDService from '../services/CRUDService';

let getHome = async(req, res) => {
    return res.render('home.ejs')
}
let getHomePage = async(req, res) => {
    try {
        let data = await db.User.findAll();//tìm tất cả dữ liệu trong bảng users
        return res.render('homepage.ejs',{
            data: JSON.stringify(data)
        });
    } catch (e) {
        console.log(e);
    }
}

let getAboutPage =(req, res) => {
    return res.render('test/about.ejs')
}
let getCRUD = (req, res) => {
    return res.render('sign-up.ejs')
}

let postCRUD = async (req, res) => {
    console.log(req.body);

    let message = await CRUDService.createNewUser(req.body);
    console.log(message);
    return res.render('responsive.ejs');
}
let displayGetCRUD = async(req, res) => {
    let data = await CRUDService.getAllUser();
    console.log('------------------');
    console.log(data);
    console.log('------------------');
    return res.render('displayUser.ejs',{
        dataTable: data, // để truyền dữ liệu data bằng biến dataTable sang cho file view: displayCRUD.ejs sửu dụng
    });
    
}

let getEditCRUD = async(req, res) =>{
    var userId = req.query.id;
    console.log(userId);
    if(userId){
        let userData = await CRUDService.getUserInfoById(userId);
        return res.render('editCRUD.ejs', {
            userData: userData,
        })
    }
    else{
        return res.send('User not found');
    }
}

let putCRUD = async(req, res) => {
    let data = req.body;
    let allUsers = await CRUDService.updateUserData(data);
    return res.render('displayUser.ejs',{
        dataTable: allUsers,
    })
}

let deleteCRUD = async(req, res) =>{
    let id = req.query.id;
    if(id){
        await CRUDService.deleteUserById(id);
        return res.send('Delete user successfully')
    }else{
        return res.send('User not found')
    }

}

let handleFormLogin = (req, res)=> {
    return res.render('login.ejs')
}

let handleLogin = async(req,res) =>{
    let email= req.body.email;
    let password= req.body.password;
    console.log(req.body);
    //các bước của server khi client gửi thông tin cho:
    // 1, check xem email của user có tồn tại hay ko
    //2, so sánh password của người dùng khi email gửi về đã tồn tại trong hệ thống
    //3, trả thêm access_token:JWT:json web token
    if(!email || !password) {
        return res.render('login2.ejs',{
            messagee: 'Missing inputs parameter email or password!'
        })
    }

    let userData = await CRUDService.hanldeUserLogin(email, password)
    // document.getElementById('divMessage').innerHTML = userData.errMessage;
    console.log(userData);

    if(userData.errCode === 0 ){
        return res.render('homepage.ejs')
    }
    else{
        // return res.status(200).json({   //với api thì viết  trả về :res.status(...).json()
        //     errCode: userData.errCode,
        //     message: userData.errMessage,
        //     user: userData.user ? userData.user : {}
        // })
        return res.render('login2.ejs',{
            messagee: userData.errMessage
        })
    }

}
let handleMusicList = async(req, res) => {
    let useData = await db.Songs.findAll({
        raw: true,
    });
    console.log(useData)
    return res.render('musicPlayList.ejs',{
        datatable: useData
    });
}

module.exports = {
    getHome: getHome,
    getHomePage: getHomePage,
    getAboutPage: getAboutPage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD,
    handleFormLogin: handleFormLogin,
    handleLogin: handleLogin,
    handleMusicList: handleMusicList,
}