import sqlite3
from sqlite3 import Error

def get_db_connection():
    try:
        # Connect to the SQLite database
        connection = sqlite3.connect('wellnessPlan3.db')
        print("Connected to SQLite database")
        return connection
    except Error as e:
        print(f"Error connecting to SQLite: {e}")
        return None

def get_treatments(predicted_disease, age_group, dosha_type):
    connection = get_db_connection()
    treatments = []
    if connection:
        try:
            cursor = connection.cursor()
            # Modify the query to handle "Generic" dosha_type
            if dosha_type == "Generic":
                query = """
                    SELECT t.treatment
                    FROM treatments t
                    JOIN diseases d ON t.Disease_id = d.Disease_id
                    JOIN age_groups ag ON t.age_group_id = ag.age_group_id
                    JOIN doshas dh ON t.dosha_id = dh.dosha_id
                    WHERE d.Disease_name = ? AND ag.age_range = ? AND dh.dosha_type = 'Generic'
                """
                cursor.execute(query, (predicted_disease, age_group))
            else:
                query = """
                    SELECT t.treatment
                    FROM treatments t
                    JOIN diseases d ON t.Disease_id = d.Disease_id
                    JOIN age_groups ag ON t.age_group_id = ag.age_group_id
                    JOIN doshas dh ON t.dosha_id = dh.dosha_id
                    WHERE d.Disease_name = ? AND ag.age_range = ? AND dh.dosha_type = ?
                """
                cursor.execute(query, (predicted_disease, age_group, dosha_type))

            results = cursor.fetchall()
            treatments = [result[0] for result in results]

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
            cursor = connection.cursor()
            if dosha_type == "Generic":
                query = """
                    SELECT d.diet
                    FROM diets d
                    JOIN diseases ON d.Disease_id_diet = diseases.Disease_id
                    JOIN age_groups ON d.age_group_id_diet = age_groups.age_group_id
                    JOIN doshas ON d.dosha_id_diet = doshas.dosha_id
                    WHERE diseases.Disease_name = ? AND age_groups.age_range = ? AND doshas.dosha_type = 'Generic'
                """
                cursor.execute(query, (predicted_disease, age_group))
            else:
                query = """
                    SELECT d.diet 
                    FROM diets d
                    JOIN diseases ON Disease_id_diet = diseases.Disease_id
                    JOIN age_groups ON d.age_group_id_diet = age_groups.age_group_id
                    JOIN doshas ON d.dosha_id_diet = doshas.dosha_id
                    WHERE diseases.Disease_name = ? AND age_groups.age_range = ? AND doshas.dosha_type = ?
                """
                cursor.execute(query, (predicted_disease, age_group, dosha_type))
            results = cursor.fetchall()
            diets = [result[0] for result in results]
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
            cursor = connection.cursor()
            if dosha_type == "Generic":
                query = """
                    SELECT l.lifestyle
                    FROM lifestyles l
                    JOIN diseases ON l.Disease_id_lifestyle = diseases.Disease_id
                    JOIN age_groups ON l.age_group_id_lifestyle = age_groups.age_group_id
                    JOIN doshas ON l.dosha_id_lifestyle = doshas.dosha_id
                    WHERE diseases.Disease_name = ? AND age_groups.age_range = ? AND doshas.dosha_type = 'Generic'
                """
                cursor.execute(query, (predicted_disease, age_group))
            else:
                query = """
                    SELECT l.lifestyle
                    FROM lifestyles l
                    JOIN diseases ON l.Disease_id_lifestyle = diseases.Disease_id
                    JOIN age_groups ON l.age_group_id_lifestyle = age_groups.age_group_id
                    JOIN doshas ON l.dosha_id_lifestyle = doshas.dosha_id
                    WHERE diseases.Disease_name = ? AND age_groups.age_range = ? AND doshas.dosha_type = ?
                """
                cursor.execute(query, (predicted_disease, age_group, dosha_type))
            results = cursor.fetchall()
            lifestyles = [result[0] for result in results]
        except Error as e:
            print(f"Error fetching lifestyles: {e}")
        finally:
            cursor.close()
            connection.close()
    return lifestyles