import subprocess
import configparser
import sys
import json
import os

import logging

config = configparser.ConfigParser()
exe_directory = os.path.dirname(sys.executable)
logging.basicConfig(
  level=logging.INFO,
  format='[%(asctime)s] [%(levelname)s]: %(message)s',
  datefmt='%Y-%m-%d %H:%M:%S',
  filename='app.log'
  )

def write_to(directory):
  if not directory:
    logging.error('Failed to cache directory.')
    return
  
  config['full_path'] = {
    'path': directory
  }
  
  logging.info('Caching directory.')
  with open('./config.ini', 'w') as file:
    config.write(file)
    
def run_yt_dlp(directory, link):
  if not directory or not link:
    logging.error('Failed to initialize yt-dlp.')
    return
  
  command = f'yt-dlp \"{link}\"'

  try:
    logging.info('Executing yt-dlp.')
    process = subprocess.run(
            command,
            shell=True,
            cwd=directory,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
            )
  except Exception as e:
    print(f'Error: {e}')

def main():
  try:
    data = sys.stdin.read()
    logging.info('Retrieving directory and video URL...')
    data = json.loads(data)
    
    saveToValue = data.get('saveTo')
    linkValue = data.get('link')
    
    logging.info('Caching directory.')
    write_to(saveToValue)
    logging.info('Initializing yt-dlp.')
    run_yt_dlp(saveToValue, linkValue)
    
  except Exception as e:
    print(f'Error: {e}')

if __name__ == '__main__':
  main()
  logging.info('yt-dlp execution completed.')
  print('Task completed')