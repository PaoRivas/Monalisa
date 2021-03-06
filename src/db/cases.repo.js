const { getConnection, mssql } = require('../database');
const helpers = require('../lib/helpers')

class CasesRepo {

  static async getCases() {
    try {
      const pool = await getConnection();
      const cases = await pool.request().query('SELECT * FROM casos');
      return cases.recordset;
    }
    catch (error) {
      console.log(error);
      throw(error);
    }
  }

  static async getCase(id) {
    try {
      const pool = await getConnection();
      const request = await pool.request();
      request.input('id', mssql.Int, id);
      const cases = await request.query('SELECT * FROM casos WHERE id = @id');
      return cases.recordset;
    }
    catch (error) {
      console.log(error);
      throw(error);
    }
  }

  static async getAllCases() {
    try {
      const pool = await getConnection();
      const cases = await pool.request().query(
        `SELECT c.*, u.nombre, t.tipo FROM casos c 
        INNER JOIN usuarios u ON c.usuario_id = u.id 
        INNER JOIN tipo_casos t ON c.tipo_caso_id = t.id
        ORDER BY c.id DESC`
        );
      return cases.recordset;
    }
    catch (error) {
      console.log(error);
      throw(error);
    }
  }

  static async getCasesbyUser(id) {
    try {
      const pool = await getConnection();
      const request = await pool.request();
      request.input('id', mssql.Int, id);
      const cases = await request.query(
        `SELECT c.*, u.nombre, t.tipo FROM casos c 
        INNER JOIN usuarios u ON c.usuario_id = u.id
        INNER JOIN tipo_casos t ON c.tipo_caso_id = t.id
        WHERE c.usuario_id = @id ORDER BY c.id DESC`
      );
      return cases.recordset;
    }
    catch (error) {
      console.log(error);
      throw(error);
    }
  }

  static async addCase(caso) {
    try {
      const {type, user, subject, description} = caso;
      const pool = await getConnection();
      const request = await pool.request();
      request.input('type',  mssql.Int, type);
      request.input('user_id',  mssql.Int, user);
      request.input('subject', mssql.VarChar(50), subject);
      request.input('description', mssql.VarChar(100), description);
      request.input('requestDate', mssql.DateTime, new Date());
      const result = await request.query(
        `INSERT INTO [dbo].[casos]
        ([tipo_caso_id], [usuario_id], [asunto], [descripcion], [creado], [creador], [modificado], [modificador])
        VALUES
        (@type, @user_id ,@subject, @description, @requestDate, 1, @requestDate, 1)`
      );
      return result.recordsets;
    }
    catch (error) {
      console.log(error);
      throw (error);
    }
  }

  
  static async deleteCase(id) {
    try {
      const pool = await getConnection();
      const request = await pool.request();
      request.input('id', mssql.Int, id);
      await request.query('DELETE FROM casos WHERE id = @id');

    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

  static async updateCase(caso) {
    try {
      const pool = await getConnection();
      const request = await pool.request();
      request.input('id', mssql.Int, caso.id);
      request.input('type',  mssql.Int, caso.type);
      request.input('user_id',  mssql.Int, caso.user);
      request.input('subject', mssql.VarChar(50), caso.subject);
      request.input('description', mssql.VarChar(100), caso.description);
      request.input('created', mssql.DateTime, new Date());
      request.input('modified', mssql.DateTime, new Date());
      await request.query(
        `UPDATE casos SET 
        [tipo_caso_id] = @type,
      [usuario_id] = @user_id,
      [asunto] = @subject, 
      [descripcion] = @description, 
      [creado] = @created, 
      [creador] = 1, 
      [modificado] = @modified, 
      [modificador] = 1
        WHERE id = @id`
      );
    } catch (error) {
      console.log(error);
      throw(error);
    }    
  }

  static async addFile(file) {
    try {
      const {id, name} = file;
      const pool = await getConnection();
      const request = await pool.request();
      request.input('case_id',  mssql.Int, id);
      request.input('name', mssql.VarChar(50), name);
      const result = await request.query(
        `INSERT INTO [dbo].[archivos]
        ([caso_id],[nombre])
        VALUES
        (@case_id,@name)`
      );
      return result.recordsets;
    }
    catch (error) {
      console.log(error);
      throw (error);
    }
  }
}

module.exports = CasesRepo