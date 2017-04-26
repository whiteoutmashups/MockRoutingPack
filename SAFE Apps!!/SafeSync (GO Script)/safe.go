package main

import (
	"bufio"
	"encoding/json"
	"github.com/cretz/go-safeclient/client"
	"io"
	"io/ioutil"
	"log"
	"os"
)

type Safe struct {
	client *client.Client
}

func initSafe() *Safe {
	conf := client.Conf{}

	confbytes, err := ioutil.ReadFile("config.conf")
	if err == nil {
		err = json.Unmarshal(confbytes, &conf)
		if err != nil {
			log.Fatal(err)
		}
	}

	safeclient := client.NewClient(conf)
	err = safeclient.EnsureAuthed(client.AuthInfo{
		App: client.AuthAppInfo{
			Name:    "SafeSync",
			ID:      "geir.SafeSync",
			Version: "0.0.1",
			Vendor:  "Geir",
		},
	})

	if err != nil {
		log.Fatal(err)
	}

	result, err := json.Marshal(safeclient.Conf)
	if err != nil {
		log.Fatal(err)
	}
	err = ioutil.WriteFile("config.conf", result, 0600)
	if err != nil {
		log.Fatal(err)
	}

	return &Safe{client: safeclient}
}

// Deletes everything (used for debugging)
func (safe *Safe) CleanUp() {
	info := client.GetDirInfo{DirPath: "/", Shared: false}
	dir, err := safe.client.GetDir(info)
	if err != nil {
		log.Println(err)
	}

	for _, file := range dir.Files {
		err := safe.client.DeleteFile(client.DeleteFileInfo{
			FilePath: file.Name,
			Shared:   false,
		})

		if err != nil {
			log.Println(err)
		}
	}
}

func (safe *Safe) RestoreFiles() {
	info := client.GetDirInfo{DirPath: "/", Shared: false}
	dir, err := safe.client.GetDir(info)
	if err != nil {
		log.Println(err)
	}

	os.Mkdir("./Restore", 0777)

	for _, file := range dir.Files {
		rc, err := safe.client.GetFile(client.GetFileInfo{FilePath: "/" + file.Name})
		if err != nil {
			log.Println(err)
		}
		defer rc.Close()
		out, err := os.Create("./Restore/" + file.Name)
		if err != nil {
			log.Println(err)
		}
		defer out.Close()
		io.Copy(out, rc)
	}
}

func (safe *Safe) UploadFile(file string) {
	f, err := os.Open(file)
	if err != nil {
		log.Println(err)
		return
	}
	defer f.Close()
	r4 := bufio.NewReader(f)

	err = safe.client.CreateFile(client.CreateFileInfo{FilePath: file})
	if err != nil {
		log.Println(err)
		return
	}

	err = safe.client.WriteFile(client.WriteFileInfo{
		FilePath: file,
		Contents: ioutil.NopCloser(r4),
	})
	if err != nil {
		log.Println(err)
		return
	}
}

func (safe *Safe) UpdateFile(file string) {
	err := safe.client.DeleteFile(client.DeleteFileInfo{
		FilePath: file,
		Shared:   false,
	})

	if err != nil {
		log.Println(err)
		return
	}

	safe.UploadFile(file)
}
