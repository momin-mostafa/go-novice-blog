# Getting Started with Go: Building a RESTful API Server with PostgreSQL Database Integration - A Beginner's Journey

May 30, 2025 10:56 PM 

I don’t have any prior experience with go. Though I did some api development which was pretty basic. I am proficient in OOP and have little to no experience with functional programming language. So, WHY AM I DOING IT ? 

Answer is to push myself out of my comfort zone. 

First of all I got to find out that go was created by the same creator of B and C language. I do have some prior experience with C which may help me understand go. I went through go’s documentation and some tutorials. And I believe I got a good grasp on some fundamentals like functions (higher order function & first class function), closures and how structure is similar to classes but without methods. Here we can add functions to a structure just like C.

so initially I want to develop a go server. That gives a response to a http request. 

Let’s get going, 

I created a folder named backend. And created a file named main.go. Now let’s google stuff.

For reference, Here’s my main.go in it’s initial state : 

```go
package main

import "fmt"

func main() {

}

func init() {
	fmt.Println("Initalizing server..")
}

```

So I found out a magic command which is 

```go
go doc <any standard library name>
```

This command opens doc file for that library name. Feels like old good days. 

I searched for two things 

```go
go doc net
go doc net/http
```

http has many sections. one of them is # Servers section. through which I got to know about 

ListenAndServe & HandleFunc and now my main.go looks like 

```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

var port string = ":8080"

func main() {

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, world")
	})

	log.Fatal(http.ListenAndServe(port, nil))
}

func init() {
	fmt.Println("Initalizing server..")
	fmt.Println("serving at : http://localhost", port)
}
```

So, that was easy !

now this line bothers me : 

```go
	log.Fatal(http.ListenAndServe(port, nil)) // why this nill ?
```

according to go docs

> ListenAndServe starts an HTTP server with a given address and handler.
The handler is usually nil, which means to use DefaultServeMux. Handle and
HandleFunc add handlers to DefaultServeMux:
> 
> 
> ```go
> http.Handle("/foo", fooHandler)
> 
> http.HandleFunc("/bar", func(w http.ResponseWriter, r *http.Request) {
>     fmt.Fprintf(w, "Hello, %q", html.EscapeString(r.URL.Path))
> })
> 
> log.Fatal(http.ListenAndServe(":8080", nil))
> 
> ```
> 

1 stack overflow page later : 

```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

var port string = ":8080"

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, world")
	})

	log.Fatal(http.ListenAndServe(port, mux))
}

func init() {
	fmt.Println("Initalizing server..")
	fmt.Println("serving at : http://localhost", port)
}

```

now let’s make this / root route restful. 

after a bit of learning I created function like the following

```go
func rootRequestHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handleGET(w)
		break
	case http.MethodPost:
		handlePOST(w)
		break
	}
}

func handleGET(w http.ResponseWriter) {
	fmt.Fprintf(w, "Hello, world from get method")
}

func handlePOST(w http.ResponseWriter) {
	fmt.Fprintf(w, "Hello, world from POST")
}
```

and updated my main function with 

```go
func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", rootRequestHandler)

	log.Fatal(http.ListenAndServe(port, mux))
}
```

and voilla I have a server that can handle GET POST. If I want to handle other stuff I can. but moving on. 

In just one hour, I went from being a complete rookie who knew nothing about Go to building a server with RESTful API capabilities. I can now create multiple endpoints that handle different request methods. The next step is to connect a database with Go. 

May 30, 2025 12:25 AM 

Okay so now I have created a database server in my local machine. and also created a local db named backend XD. this initial setup took some time. but it’s okay. it was a good one hour of brushing up my old skills. 

But the thing is writing sql query by hand feels too much work. 

anyways my main.go now looks like 

```go
package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

var port string = ":8080"
var db *sql.DB

func rootRequestHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handleGET(w)
	case http.MethodPost:
		handlePOST(w)
	}
}

func handleGET(w http.ResponseWriter) {
	fmt.Fprintf(w, "Hello, world from get method")
}

func handlePOST(w http.ResponseWriter) {
	
	fmt.Fprintf(w, "Hello, world from POST")
}

func initalizeDB() *sql.DB {
	connStr := "host=localhost port=5432 user=tamim password=tamim dbname=backend sslmode=disable"

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Could not connect:", err)
	}

	fmt.Println("Connected to PostgreSQL!")

	return db
}

func main() {
	db = initalizeDB()

	defer db.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("/", rootRequestHandler)

	log.Fatal(http.ListenAndServe(port, mux))
}

func init() {
	fmt.Println("Initalizing server..")
	fmt.Printf("serving at : http://localhost%s\n", port)
}

```

I did use ChatGPT for help, but rather than copying generated code directly, I requested examples and studied them thoroughly to understand the concepts better. 

let me go through my code real quick. I’m using a db named variable in which I’m keeping a pointer of my db. which I’ll explain why I did that in later stages. I have also initlaised my db through a helper function named initalizeDB

okay there are few things I should clear out. Here we are not checking if db pointer is nil or not. which is not a good thing. in that case we should exit from main. other than that I’m happy with progress till now. 

May 30, 2025 1:27 AM 

taking a break to enjoy the monsoon rain.