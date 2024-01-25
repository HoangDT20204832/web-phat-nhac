//mỗi khi bạn truy cập avof 1 đường link của website của bạn thì nó sẽ chạy vào file này đầu tiên
import express from "express";
import homeControlor from "../controllers/homeControlor";
import userControlor from "../controllers/userControlor"
// import appjs from '../public/javascript/app'
let router = express.Router();

let initWebRouters = (app) =>  {

    router.get('/home', homeControlor.getHome);
    router.get('/', homeControlor.getHomePage);
    router.get('/about', homeControlor.getAboutPage);
    router.get('/crud', homeControlor.getCRUD);
    router.post('/post-crud', homeControlor.postCRUD);
    router.get('/get-crud', homeControlor.displayGetCRUD);
    router.get('/edit-crud', homeControlor.getEditCRUD);//chỉnh sửa htoong tin người dùng
    router.post('/put-crud', homeControlor.putCRUD);
    router.get('/delete-crud', homeControlor.deleteCRUD);

    router.get('/login', homeControlor.handleFormLogin)
    router.post('/post-login', homeControlor.handleLogin)
    router.get('/music-list', homeControlor.handleMusicList);

    router.post('/api/login',userControlor.handleLogin);
    router.get('/api/get-all-users',userControlor.handleGetAllUsers);
    router.post('/api/create-new-user',userControlor.handleCreateNewUser);
    router.put('/api/edit-user',userControlor.handleEditUser);
    router.delete('/api/delete-user',userControlor.handleDeleteUser);

    return app.use("/", router);
}

module.exports = initWebRouters; //muốn sử dụng hàm initWebRouters ngoài file này thì phải thực hiện thêm dòng này
