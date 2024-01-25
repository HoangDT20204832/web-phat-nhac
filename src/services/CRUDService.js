import bcrypt from 'bcryptjs'//import thư viện bcryptjs vào để thực hiện băm mật khẩu người dùng ở phía server
import db from '../models/index';// để tạo người dùng trong database thì ta phải import db vào 


var salt = bcrypt.genSaltSync(10);

let createNewUser= async(data) =>{
    return new Promise(async(resolve, reject) =>{
        try {
            let hashPasswordFromBcrypt = await hashUserPassword(data.password);
            await db.User.create({// tạo thông tin người dùng của table User bằng hàm create squylize
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phonenumber: data.phonenumber,
                gender: data.gender === '1' ? true : false,
                roleId: data.roleId,
            })
            resolve('ok create  a new user success')
        } catch (e) {
            reject(e);
        }
    })

}

let hashUserPassword= (password) =>{
    return new Promise(async(resolve, reject) =>{
        try {
           let hashPassword = await bcrypt.hashSync(password, salt);
           resolve(hashPassword);            
        } catch (e) {
            reject(e);
        }
    })
}

let getAllUser = () => {
    return new Promise (async(resolve, reject) =>{
        try {
            let users = await db.User.findAll({
                raw: true,//giúp hiển thị dữ liệu gốc, ko hiển thị dư thuaawf dữ liệu
            });
            resolve(users);
        } catch (e) {
            reject(e);
        }
    })
}

let getUserInfoById = (userId)=>{ //hàm lấy ra dữ liệu người dùng có id = ?
    return new Promise(async(resolve, reject)=>{
        try {
            let user = await db.User.findOne({
                where: {id: userId},
                raw: true,
            })

            if (user) {
                resolve(user);
            }else{
                resolve({});
            }
        } catch (e) {
            reject(e);
        }
    })
}

let updateUserData = (data)=>{
    return new Promise(async(resolve, reject)=>{
        try {
            let user = await db.User.findOne({
                where: {id: data.id},
            })
            if(user){
                user.email = data.email;
                user.firstName= data.firstName;
                user.lastName= data.lastName;
                user.address = data.address;
                user.phonenumber= data.phonenumber;

                await user.save();

                let allUsers = await db.User.findAll();
                resolve(allUsers);

            }else{
                resolve();
            }
        } catch (e) {
            reject(e);
        }
    })
}

let deleteUserById = (userId) =>{
    return new Promise(async(resolve, reject) =>{
        try {
            let user = await db.User.findOne({
                where: {id: userId},
            });
            if(user){
                user.destroy();
            }
            resolve();//return 
        } catch (e) {
            reject(e);
        }
    })
}

let hanldeUserLogin = (email, password) =>{
    return new Promise(async(resolve,reject) =>{
        try {
            let userData = {};
            let isExit = await checkUserEmail(email);
            if(isExit){
                //user đã tồn tại(do tìm thaấy email trong database)
                //kiếm tra password gửi lên
                let user = await db.User.findOne({
                    where: {email : email},
                    attributes: ['email', 'password'],
                    raw: true
                })
                if(user){
                    //kiem tra password 
                    let check = await bcrypt.compareSync(password, user.password);
                    if(check){
                        userData.errCode = 0;
                        userData.errMessage= 'Ok';

                        delete user.password;
                        userData.user = user;
                    }else{
                        userData.errCode = 3;
                        userData.errMessage= 'Wrong password';
                    }
                }else{
                    userData.errCode = 2;
                    userData.errMessage = `User's not found`
                }
            }else{
                //return erorr
                userData.errCode = 1;
                userData.errMessage = `Your's Email isn't  exist in your system. Ply try your email!`
            }

            resolve(userData);
        } catch (e) {
            reject(e);
        }
    })
}


let checkUserEmail = (userEmail) =>{
    return new Promise(async(resolve, reject) =>{
        try {
            let user = await db.User.findOne({
                where: {email: userEmail}
            })
            if(user){
                resolve(true);
            }else{
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createNewUser: createNewUser,
    getAllUser: getAllUser,    //lấy tất cả người dùng trong db ra :
    getUserInfoById: getUserInfoById,
    updateUserData: updateUserData,
    deleteUserById: deleteUserById,

    hanldeUserLogin: hanldeUserLogin,
    checkUserEmail: checkUserEmail,
}