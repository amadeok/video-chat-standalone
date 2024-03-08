import subprocess
import threading
import os
import signal
import time

command =  ['/home/ubuntu/loophole-cli_1.0.0-beta.15_linux_64bit/loophole', 'http', '3000', '--hostname', 'video-chat-ayurveda-108']

class ProcessManager:
    def __init__(self):
        self.stop = False
        self.process = None
        self.forwarded = False

    def logger(self, source):
        while True:
            line = source.readline()
            #print("2")
            if line:
                print(line.decode().strip())  # Print the output
            if self.stop:
                break
            time.sleep(0.5)
            

    def run_process(self, command):
        try:
            self.process = subprocess.Popen(command,
                                            stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            # Monitor stdout for the desired output
            while True:
                line = self.process.stdout.readline()
                #print("1")
                if line:
                    print(line.decode().strip())  # Print the output
                    if b'Forwarding' in line:
                        print("FORWARD FOUND")
                        self.forwarded = True
                        threading.Thread(target=self.logger, args=[self.process.stdout,]).start()
                        threading.Thread(target=self.logger, args=[self.process.stderr,]).start()

                        break  # Exit the loop if "Forwarding" is found

        except Exception as e:
            print("ex", e)

    def kill_process(self):
        if self.process.poll() is None:
            print("Process didn't forward, killing...")
            os.kill(self.process.pid, signal.SIGTERM)

    def run(self, command):
        # Run the process and monitor it
        n = 0
        while True:
            print(f"\n\nAttempt {n} ....\n\n")
            n += 1
            process_thread = threading.Thread(target=self.run_process, args=(command,))
            process_thread.start()
            process_thread.join(timeout=10)  # Wait for 10 seconds

            if process_thread.is_alive():
                # If the process is still running after 10 seconds, kill it
                self.kill_process()
            else:
                break  # Exit the loop if the process completes successfully
        print("waiting for process to end..")
        self.process.wait()
        self.stop = True
        print("All terminated, exiting..")

# Example usage:
if __name__ == "__main__":
    process_manager = ProcessManager()
    #command = command
    process_manager.run(command)

