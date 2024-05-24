import psycopg2
import requests
import zipfile
import os

from dotenv import load_dotenv
load_dotenv(dotenv_path="C:\\Users\\Public\\data\\.env")

db_params = {
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_DATABASE'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
}

"""
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!                                                                                                                                                                                               !!
!!                 Zbog petljanja oko postgre permission ova skripta se nalazi u public gdje postgre moze pristupiti, tako da su pathovi ovdje absolute svi i treba ih promjeniti                !!
!!                  (probao s psycopg2.copy_from i expert, ali problemi tijekom loadanja velikog filea kao stdin, znam da nije najljepse rijesenje)                                              !!
!!                                                                                                                                                                                               !!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
"""



zip_url = 'https://www.zet.hr/gtfs-scheduled/latest'
local_destination = 'C:\\Users\\Public\\data\\latest.zip'
extracted_folder = 'C:\\Users\\Public\\data'

def download_zip(url, destination):
    response = requests.get(url)
    
    if response.status_code == 200:
        with open(destination, 'wb') as file:
            file.write(response.content)
        print(f"ZIP file downloaded successfully to {destination}")
    else:
        print(f"Failed to download ZIP file. Status code: {response.status_code}")

def unzip_file(zip_path, extract_path):
    os.makedirs(extract_path, exist_ok=True)
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)
    print(f"ZIP file extracted successfully to {extract_path}")

# Function to execute SQL commands
def execute_sql(connection, cursor, sql):
    cursor.execute(sql)
    connection.commit()

# Function to load data from CSV to PostgreSQL
def load_csv_to_postgres(connection, cursor, table_name, csv_file_path):
    abs_csv_file_path = "C:\\Users\\Public\\data\\" + csv_file_path
    try:
        # Drop existing data from the table
        drop_table_sql = f'TRUNCATE {table_name} CASCADE;'
        execute_sql(connection, cursor, drop_table_sql)
        
        copy_sql = f"""
        COPY {table_name} FROM '{abs_csv_file_path}' WITH
            CSV
            HEADER
            DELIMITER as ','
        """
        execute_sql(connection, cursor, copy_sql)
        print(f"Loaded {table_name}")
    except Exception as e:
        print(f"Error loading {table_name}: {e}")


download_zip(zip_url, local_destination)
unzip_file(local_destination, extracted_folder)

try:
    # Connect to PostgreSQL
    connection = psycopg2.connect(**db_params)
    cursor = connection.cursor()

    # Load data to each table
    load_csv_to_postgres(connection, cursor, 'routes', 'routes.txt')
    load_csv_to_postgres(connection, cursor, 'stops', 'stops.txt')
    load_csv_to_postgres(connection, cursor, 'trips', 'trips.txt')
    load_csv_to_postgres(connection, cursor, 'stop_times', 'stop_times.txt')

finally:
    # Close the cursor and connection
    if cursor:
        cursor.close()
    if connection:
        connection.close()