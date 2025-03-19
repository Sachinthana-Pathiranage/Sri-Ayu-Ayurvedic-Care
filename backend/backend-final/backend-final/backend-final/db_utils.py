import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

def get_db_connection():
    try:
        # Retrieve database credentials from environment variables
        db_host = os.getenv('DB_HOST')
        db_port = os.getenv('DB_PORT')
        db_user = os.getenv('DB_USER')
        db_password = os.getenv('DB_PASSWORD')
        db_name = os.getenv('DB_NAME')

        # Establish the database connection
        connection = mysql.connector.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database=db_name
        )
        if connection.is_connected():
            print("Connected to the database")
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def get_treatments(predicted_disease, age_group, dosha_type):
    connection = get_db_connection()
    treatments = []
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            # Modify the query to handle "Generic" dosha_type
            if dosha_type == "Generic":
                query = """
                            SELECT t.treatment
                            FROM treatments t
                            JOIN diseases d ON t.Disease_id = d.Disease_id
                            JOIN age_groups ag ON t.age_group_id = ag.age_group_id
                            JOIN doshas dh ON t.dosha_id = dh.dosha_id
                            WHERE d.Disease_name = %s AND ag.age_range = %s AND dh.dosha_type = 'Generic'
                            """
            else:
                query = """
                            SELECT t.treatment
                            FROM treatments t
                            JOIN diseases d ON t.Disease_id = d.Disease_id
                            JOIN age_groups ag ON t.age_group_id = ag.age_group_id
                            JOIN doshas dh ON t.dosha_id = dh.dosha_id
                            WHERE d.Disease_name = %s AND ag.age_range = %s AND dh.dosha_type = %s
                            """

            # Execute the query with appropriate parameters
            if dosha_type == "Generic":
                cursor.execute(query, (predicted_disease, age_group))
            else:
                cursor.execute(query, (predicted_disease, age_group, dosha_type))

            results = cursor.fetchall()
            treatments = [result['treatment'] for result in results]

            if not treatments:
                print("No treatments found for the given parameters")
        except Error as e:
            print(f"Error fetching treatments: {e}")
        finally:
            cursor.close()
            connection.close()
    return treatments

def get_diets(predicted_disease, age_group, dosha_type):
    connection = get_db_connection()
    diets = []
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            if dosha_type == "Generic":
                query = """
                SELECT d.diet
                FROM diets d
                JOIN diseases ON d.Disease_id_diet = diseases.Disease_id
                JOIN age_groups ON d.age_group_id_diet = age_groups.age_group_id
                JOIN doshas ON d.dosha_id_diet = doshas.dosha_id
                WHERE diseases.Disease_name = %s AND age_groups.age_range = %s AND doshas.dosha_type = 'Generic'
                """
                cursor.execute(query, (predicted_disease, age_group))
            else:
                query = """
                SELECT d.diet 
                FROM diets d
                JOIN diseases ON Disease_id_diet = diseases.Disease_id
                JOIN age_groups ON d.age_group_id_diet = age_groups.age_group_id
                JOIN doshas ON d.dosha_id_diet = doshas.dosha_id
                WHERE diseases.Disease_name = %s AND age_groups.age_range = %s AND doshas.dosha_type = %s
                """
                cursor.execute(query, (predicted_disease, age_group, dosha_type))
            results = cursor.fetchall()
            diets = [result['diet'] for result in results]
        except Error as e:
            print(f"Error fetching diets: {e}")
        finally:
            cursor.close()
            connection.close()
    return diets

def get_lifestyles(predicted_disease, age_group, dosha_type):
    connection = get_db_connection()
    lifestyles = []
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            if dosha_type == "Generic":
                query = """
                SELECT l.lifestyle
                FROM lifestyles l
                JOIN diseases ON l.Disease_id_lifestyle = diseases.Disease_id
                JOIN age_groups ON l.age_group_id_lifestyle = age_groups.age_group_id
                JOIN doshas ON l.dosha_id_lifestyle = doshas.dosha_id
                WHERE diseases.Disease_name = %s AND age_groups.age_range = %s AND doshas.dosha_type = 'Generic'
                """
                cursor.execute(query, (predicted_disease, age_group))
            else:
                query = """
                SELECT l.lifestyle
                FROM lifestyles l
                JOIN diseases ON l.Disease_id_lifestyle = diseases.Disease_id
                JOIN age_groups ON l.age_group_id_lifestyle = age_groups.age_group_id
                JOIN doshas ON l.dosha_id_lifestyle = doshas.dosha_id
                WHERE diseases.Disease_name = %s AND age_groups.age_range = %s AND doshas.dosha_type = %s
                """
                cursor.execute(query, (predicted_disease, age_group, dosha_type))
            results = cursor.fetchall()
            lifestyles = [result['lifestyle'] for result in results]
        except Error as e:
            print(f"Error fetching lifestyles: {e}")
        finally:
            cursor.close()
            connection.close()
    return lifestyles