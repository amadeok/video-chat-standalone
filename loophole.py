import subprocess
import threading
import os
import signal

def run_process():
    # Run your process here
    
    global process
    process = subprocess.Popen(['/home/ubuntu/loophole-cli_1.0.0-beta.15_linux_64bit/loophole', 'http', '3000', '--hostname', 'video-chat-ayurveda-108'],   stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Monitor stdout for the desired output
    while True:
        line = process.stdout.readline()
        if line:
            print(line.decode().strip())  # Print the output
            if b'Forwarding' in line:
                break  # Exit the loop if "Forwarding" is found

def kill_process():
    if  process.poll() is None:
        print("Process didn't forward, killing...")
        os.kill(process.pid, signal.SIGTERM)

# Run the process and monitor it
n = 0
while True:
    print(f"\n\nAttempt {n} ....\n\n")
    n+=1
    process_thread = threading.Thread(target=run_process)
    process_thread.start()
    process_thread.join(timeout=10)  # Wait for 10 seconds

    if process_thread.is_alive():
        # If the process is still running after 10 seconds, kill it
        kill_process()
    else:
        break  # Exit the loop if the process completes successfully
