import psycopg2
import requests
import zipfile
import os

zip_url = ''
local_destination = ''
extracted_folder = ''

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
    # Drop existing data from the table
    drop_table_sql = f'TRUNCATE {table_name} CASCADE;'
    execute_sql(connection, cursor, drop_table_sql)

    # Load new data from CSV
    copy_sql = f"""
        COPY {table_name} FROM '{csv_file_path}' WITH
            CSV
            HEADER
            DELIMITER as ','
        """
    execute_sql(connection, cursor, copy_sql)
    print(f"Loaded {table_name}")

# PostgreSQL connection parameters
db_params = {
    'host': '',
    'database': '',
    'user': '',
    'password': '',
}

download_zip(zip_url, local_destination)
unzip_file(local_destination, extracted_folder)

# Connect to PostgreSQL
connection = psycopg2.connect(**db_params)
cursor = connection.cursor()

# Load data to each table
load_csv_to_postgres(connection, cursor, '', '')

# Close the cursor and connection
cursor.close()
connection.close()