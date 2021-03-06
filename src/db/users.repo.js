const { getConnection, mssql } = require('../database');
const helpers = require('../lib/helpers')

class UsersRepo {

  static async getUsers() {
    try {
      const pool = await getConnection();
      const users = await pool.request().query('SELECT * FROM usuarios');
      return users.recordset;
    }
    catch (error) {
      console.log(error);
      throw(error);
    }
  }

  static async getUser(id) {
    try {
      const pool = await getConnection();
      const request = await pool.request();
      request.input('id', mssql.Int, id);
      const user = await request.query('SELECT * FROM usuarios WHERE id = @id');
      return user.recordset;
    }
    catch (error) {
      console.log(error);
      throw(error);
    }
  }

  static async getRolUsers() {
    try {
      const pool = await getConnection();
      const users = await pool.request().query(
        `SELECT us.*, r.descripcion
        FROM usuarios us 
        LEFT JOIN roles r 
        ON us.rol_id = r.id `
        );
      return users.recordset;
    }
    catch (error) {
      console.log(error);
      throw(error);
    }
  }

  static async addUser(user) {
    try {
      const {role, fullname, email, cellphone, identity} = user;
      let {password} = user;
      const pool = await getConnection();
      const request = await pool.request();
      password = await helpers.encryptPassword(password);
      request.input('role_id',  mssql.Int, role);
      request.input('fullname', mssql.VarChar(50), fullname);
      request.input('email', mssql.VarChar(50), email);
      request.input('password', mssql.VarChar(100), password);
      request.input('cellphone', mssql.VarChar(15), cellphone);
      request.input('identity', mssql.VarChar(15), identity);
      request.input('requestDate', mssql.DateTime, new Date());
      const result = await request.query(
        `INSERT INTO [dbo].[usuarios] 
        (rol_id, nombre, email, password, celular, c_identidad, intentos, inactivo, fecha_password, creado, creador, modificado, modificador)  
        OUTPUT inserted.id VALUES 
        (@role_id, @fullname, @email, @password, @cellphone, @identity, 1, 0, @requestDate, @requestDate, 1, @requestDate, 1)`
      );
      return result.recordsets;
    }
    catch (error) {
      console.log(error);
      throw (error);
    }
  }

  
  static async deleteUser(id) {
    try {
      const pool = await getConnection();
      const request = await pool.request();
      request.input('id', mssql.Int, id);
      await request.query('DELETE FROM usuarios WHERE id = @id');

    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

  static async updateUser(user) {
    try {
      const pool = await getConnection();
      const request = await pool.request();
      request.input('id', mssql.Int, user.id);
      request.input('role_id',  mssql.Int, user.role);
      request.input('name', mssql.VarChar(50), user.fullname);
      request.input('email', mssql.VarChar(50), user.email);
      request.input('cellphone', mssql.VarChar(15), user.cellphone);
      request.input('identity', mssql.VarChar(15), user.identity);
      await request.query(
        `UPDATE usuarios SET 
        rol_id = @role_id, nombre = @name, email = @email, celular = @cellphone, c_identidad = @identity 
        WHERE id = @id`
      );
    } catch (error) {
      console.log(error);
      throw(error);
    }    
  }
}

module.exports = UsersRepo