import pool from "../../../config/database.js";

class BaseRepository {

    async query(sql, params = []) {
        const { rows } = await pool.query(sql, params);
        return rows;
    }

}

export default BaseRepository;