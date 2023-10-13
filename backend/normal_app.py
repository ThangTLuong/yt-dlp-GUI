import subprocess
import configparser
import sys
import json
import os

config = configparser.ConfigParser()
exe_directory = os.path.dirname(sys.executable)

def write_to(directory):
  if not directory:
    return
  
  config['full_path'] = {
    'path': directory
  }
  
  with open('./config.ini', 'w') as file:
    config.write(file)
    
def run_yt_dlp(directory, link):
  if not directory or not link:
    return
  
  command = f'yt-dlp \"{link}\"'

  try:
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
    data = json.loads(data)
    
    saveToValue = data.get('saveTo')
    linkValue = data.get('link')
    
    write_to(saveToValue)
    run_yt_dlp(saveToValue, linkValue)
    
  except Exception as e:
    print(f'Error: {e}')

if __name__ == '__main__':
  main()
  print('Task completed')