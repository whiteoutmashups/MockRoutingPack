package main

import (
	"bufio"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"
	"time"
)

var filemap map[string]time.Time

func readDataFile(filename string) error {
	fh, err := os.Open(filename)
	if err != nil {
		if err.Error() == "open .safesync: no such file or directory" {
			return err
		}
		log.Fatal(err) // Some other error accured, don't continue
	}

	defer fh.Close()
	scanner := bufio.NewScanner(fh)
	scanner.Split(bufio.ScanLines)

	for scanner.Scan() {
		s := strings.Split(scanner.Text(), ";")

		t := time.Time{}
		err := t.UnmarshalText([]byte(s[1]))
		if err != nil {
			log.Fatal(err)
		}
		filemap[s[0]] = t
	}

	return nil
}

func writeDataFile(filename string) {
	f, err := os.Create(filename)
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()

	for key, data := range filemap {
		t, _ := data.MarshalText()
		_, err := f.WriteString(key + ";" + string(t) + "\n")
		if err != nil {
			log.Fatal(err)
		}
	}

	f.Sync()
}

func main() {
	client := initSafe()

	if len(os.Args) > 1 {
		if os.Args[1] == "restore" {
			client.RestoreFiles()
			os.Exit(0)
		}

		if os.Args[1] == "cleanup" {
			client.CleanUp()
			os.Exit(0)
		}
	}

	filemap = make(map[string]time.Time)
	readDataFile(".safesync") // If an error occurs we will create the file later

	files, _ := ioutil.ReadDir("./")
	for _, file := range files {
		if file.IsDir() || file.Name() == ".safesync" || file.Name() == "config.conf" || file.Name() == "SafeSync" {
			continue
		}
		filetime, ok := filemap[file.Name()]
		if !ok { // Add if not in the map
			client.UploadFile(file.Name())
			filemap[file.Name()] = file.ModTime()
			fmt.Println("New file found " + file.Name())
			continue
		}

		if filetime != file.ModTime() {
			client.UpdateFile(file.Name())
			fmt.Println(file.Name() + " change detected")
			filemap[file.Name()] = file.ModTime()
		}
	}

	writeDataFile(".safesync")
}
