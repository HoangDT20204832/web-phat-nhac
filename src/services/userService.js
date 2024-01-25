import db from '../models/index'
import bcrypt from 'bcryptjs'//import thư viện bcryptjs vào để thực hiện băm mật khẩu người dùng ở phía server

var salt = bcrypt.genSaltSync(10);

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
                    attributes: ['email', 'password', 'roleId'],
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

let getAllUsers = (userId)=>{
    return new Promise(async(resolve,reject) =>{
        try {
            let users = '';
            if(userId == 'All'){
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']     //giups an di thuoc tinh password tra ra 
                    }
                })
            }
            if(userId && userId !=='All'){
                users = await db.User.findOne({
                    where: {id : userId},
                    attributes: {
                        exclude: ['password']     //giups an di thuoc tinh password tra ra 
                    }
                })
            }

            resolve(users);
        } catch (e) {
            reject(e);
        }
    })
}

let createNewUser = (data)=>{
    return new Promise(async(resolve, reject) =>{
        try {
            //check email is exit
            let check = await checkUserEmail(data.email);
            if(check === true){
                resolve({
                    errCode: 1,
                    errMessage: 'Your email already in used. Plz try another email!',
                })
            }else{
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
                resolve({
                    errCode: 0,
                    message: 'OK',
                })
            }

        } catch (e) {
            reject(e);
        }
    })
}

let deleteUser = (userId) =>{
    return new Promise(async(resolve, reject) =>{
        let foundUser = await db.User.findOne({
            where: {id: userId,},
            raw: false   //set laị raw từ true thành flase để trả lại mặc định của sequalize để có thể dùng c1 để xóa},
        })
        if(!foundUser){
            resolve({
                errCode:2,
                errMessage:'The user is not exist'
            })
        }

        await foundUser.destroy();  //c1:xóa ở phái nodejs
        // await db.User.destroy({   //c2:xóa trucwjh tiếp ở phia db
        //     where: {id: userId},
        // })
        resolve({
            errCode:0,
            message:'The user is deleted'
        });
    })
}

let updateUser = (data) =>{
    return new Promise(async(resolve, reject) =>{
        try {
            if(!data.id){
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameter'
                })
            }
            let user = await db.User.findOne({
                where: {id: data.id},
                raw: false, //tuonwg tu nhu phan delete do ta đã set cứng raw: true ở phần config.json rồi
            })
            if(user){
                user.email = data.email;
                user.firstName= data.firstName;
                user.lastName= data.lastName;
                user.address = data.address;
                user.phonenumber= data.phonenumber;

                await user.save();
                resolve({
                    errCode: 0,
                    message: 'Update the user successfully'
                });

            }else{
                resolve({
                    errCode: 1,
                    errMessage: 'User not found'
                });
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports ={
    hanldeUserLogin: hanldeUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUser: updateUser
}