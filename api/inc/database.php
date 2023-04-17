<?php
/**
 * ========================================================================
 * CONFIGURACIÓN DEL ACCESO A LA BASE DE DATOS
 * ========================================================================
 */
class Database{
    // Configuración del servidor de base de datos
    // private $HOST     = "localhost"; // si no funciona con $HOST="127.0.0.1", probar con éste.
    private $HOST              = "127.0.0.1";
    private $DB_DATABASE_NAME  = "websocial";
    private $DB_USERNAME       = "pcw";
    private $DB_PASSWORD       = "pcw";
    public  $conn;

    // =================================================================================
    // CONSTRUCTOR. Obtiene la conexión con la BD
    // =================================================================================
    public function __construct()
    {
        try{
            $this->conn = new PDO("mysql:host=" . $this->HOST . ";dbname=" . $this->DB_DATABASE_NAME, $this->DB_USERNAME, $this->DB_PASSWORD);
            $this->conn->exec("set names utf8");
        }catch(PDOException $exception){
            echo "Error de conexión con la BD: " . $exception->getMessage();
        }
        // And pass optional (but important) PDO attributes
        $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    // =================================================================================
    // Obtiene la conexión con la BD
    // =================================================================================
    public function getConnection(){
        return $this->conn;
    }

    // =================================================================================
    // Comprueba si la combinación login de usuario y token de seguridad es válida:
    // =================================================================================
    public function comprobarSesion($login, $token)
    {
        $valorRet = false;
        $mysql    = 'select * from usuario where login=:LOGIN';
        $stmt     = $this->conn->prepare($mysql);
        $stmt->execute([':LOGIN' => $login]); // execute query

        if($stmt->rowCount())
        {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if($row['token'] == $token)
                $valorRet = true;
        }
        else
        {
            $RESPONSE_CODE    = 500;
            $R['RESULTADO']   = 'ERROR';
            $R['CODIGO']      = $RESPONSE_CODE;
            $R['DESCRIPCION'] = 'No existe el usuario en la BD';
        }
        return $valorRet;
    }

    // =================================================================================
    // =================================================================================
    // FUNCIONES PROPIAS DE INTERACCIÓN CON LA BD
    // =================================================================================
    // =================================================================================

    // =================================================================================
    // SENTENCIAS DE TIPO SELECT
    // =================================================================================
    public function select($query = "" , $params = [])
    {
        $result = false;
        $RESPUESTA = [];

        try {
            $stmt = $this->conn->prepare( $query );
            if($stmt === false) {
                throw New Exception("Unable to do prepared statement: " . $query);
            }

            $stmt->execute($params);

            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt->closeCursor();
            $RESPUESTA['CORRECTO'] = true;
        } catch(Exception $e) {
            // throw New Exception( $e->getMessage() );
            $RESPUESTA['CORRECTO'] = false;
            $RESPUESTA['ERROR'] = $e->getMessage();
        }

        $RESPUESTA['RESULT'] = $result;

        return $RESPUESTA;
    }
 
    // =================================================================================
    // SENTENCIAS INSERT, DELETE, UPDATE/PUT
    // =================================================================================
    public function executeStatement($query = "", $params = [])
    {
        $retVal = false;
        try {
            $stmt = $this->conn->prepare( $query );
 
            if($stmt === false) {
                throw New Exception("Unable to do prepared statement: " . $query);
            }
 
            if( $params )
                $retVal = $stmt->execute($params);
            else
                $retVal = $stmt->execute();

        } catch(Exception $e) {
            throw New Exception( $e->getMessage() );
        }   

        return $retVal;
    }

}

?>