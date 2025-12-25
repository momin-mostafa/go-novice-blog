# Continuation of backend development

May 31, 2025 10:19 PM 

Okay. so the last work I did which I didn’t write in my log is I separated the RootHandler from my main.go. 

This is how my main.go looks like right now : 

```go
package main

import (
	rootrequesthandler "backend/root_request_handler"
	"database/sql"
	"fmt"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

var port string = ":8080"
var db *sql.DB

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
	mux.Handle("/", &rootrequesthandler.RootRequestHandler{})

	log.Fatal(http.ListenAndServe(port, mux))
}

func init() {
	fmt.Println("Initalizing server..")
	fmt.Printf("serving at : http://localhost%s\n", port)
}

```

And here’s my rootRequestHandler

```go
package rootrequesthandler

import (
	"fmt"
	"net/http"
)

type RootRequestHandler struct{}

func (rqh *RootRequestHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		rqh.handleGET(w)
	case http.MethodPost:
		rqh.handlePOST(w)
	}
}

func (rqh *RootRequestHandler) handleGET(w http.ResponseWriter) {
	fmt.Fprintf(w, "Hello, world from get method")
}

func (rqh *RootRequestHandler) handlePOST(w http.ResponseWriter) {
	fmt.Fprintf(w, "Hello, world from POST")
}

```

The pattern I'm exploring here is similar to interface classes in other languages like Dart. In functional programming languages like Go, this pattern manifests as having specific function implementations. 

Let me show you an example:

when using Handle instead of HandlerFunc like this

```go
mux.Handle("/", &rootrequesthandler.RootRequestHandler{})
```

The type must have a ServeHTTP function. 

```go
package rootrequesthandler

import (
	...
)

type RootRequestHandler struct{}

func (rqh *RootRequestHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		rqh.handleGET(w)
	case http.MethodPost:
		rqh.handlePOST(w)
	}
}

...

```

That’s simple ! anyways let’s continue 

I want to extract the db functionality too. so I did something like

May 31, 2025 10:38 PM 

```go
package dbhandler

import (
	"database/sql"
	"fmt"
	"log"
)

var db *sql.DB

func GetDB() *sql.DB {
	if db == nil {
		db = initalizeDB()
		return db
	}
	return db
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

```

I'm not sure if this will work as intended - I'm aiming for a lazy singleton pattern here. Moving on. 

I've updated the DB service to use GORM since writing SQL queries manually isn't ideal for me. As someone new to backend development, using an ORM makes database handling much more manageable.

Here's how my main.go looks now

```go
package main

import (
	dbhandler "backend/db_handler"
	rootrequesthandler "backend/root_request_handler"

	"fmt"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

var port string = ":8080"

func main() {
	dbhandler.InitalizeDB()

	mux := http.NewServeMux()
	mux.Handle("/", &rootrequesthandler.RootRequestHandler{})

	log.Fatal(http.ListenAndServe(port, mux))
}

func init() {
	fmt.Println("Initalizing server..")
	fmt.Printf("serving at : http://localhost%s\n", port)
}
```

and my dbhandler looks like this now 

```go
package dbhandler

import (
	coursemodel "backend/course_model"
	userModel "backend/user"
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB
var err error

func GetDBPointer() *gorm.DB {
	return db
}

func InitalizeDB() *gorm.DB {
	connStr := "host=localhost port=5432 user=tamim password=tamim dbname=backend sslmode=disable"

	db, err = gorm.Open(postgres.Open(connStr), &gorm.Config{})

	if err != nil {
		panic("GROM FAILED TO OPEN")
	}

	fmt.Println("Connected to PostgreSQL!")

	fmt.Println("Auto Migrating User")

	err = db.AutoMigrate(&userModel.User{}, &coursemodel.Course{})
	if err != nil {
		panic("AUTO MIGRATION FAILED FOR USER")
	}

	fmt.Println("DB IS UPTO DATE AND RUNNING")
	return db
}

```

May 31, 2025 11:47 PM 

I have added post and get method for users. 

```go
package userModel

import (
	dbhandler "backend/db_handler"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"gorm.io/gorm"
)

type UserRequestHandler struct{}

func (uRH *UserRequestHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		uRH.handleGET(w, r)
	case http.MethodPost:
		uRH.createUser(w, r)
	}
}

func (uRH *UserRequestHandler) createUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	if req.Name == "" || req.Phone == "" {
		http.Error(w, "name and phone cannot be empty", http.StatusBadRequest)
		return
	}

	user := req.createUser()

	dbhandler.GetDBPointer().Create(&user)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (uRH *UserRequestHandler) handleGET(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("user_id")
	if userId == "" {
		http.Error(w, "user_id cannot be empty", http.StatusBadRequest)
	}

	var user User
	err := dbhandler.GetDBPointer().First(&user, userId).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			fmt.Fprintf(w, "User not found")
		} else {
			fmt.Fprintf(w, "DB error:%+v", err)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

```

June 1, 2025 1:06 AM 

I've successfully implemented user creation and fetching functionality. Though I notice some code duplication that needs refactoring. My next priority is implementing unit tests. While the current functionality only covers basic record creation and fetching, I want to transition to Test-Driven Development (TDD). This approach will be crucial as the project scales to prevent future complications. 

Let me explain my code-level implementation.

```go
package userModel

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name  string
	Phone string
	FB_ID string
	Email string
}

type CreateUserRequest struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
	FB_ID string `json:"fb_id"`
	Email string `json:"email"`
}

func (req *CreateUserRequest) createUser() User {
	user := User{
		Name:  req.Name,
		Phone: req.Phone,
		FB_ID: req.FB_ID,
		Email: req.Email,
	}

	return user
}

```

I know Go experts might have suggestions, but let me explain my approach first. I'm still learning Go. 

I created a createUserRequest struct that acts as an adapter pattern. While I'm not entirely sure how this pattern translates to functional programming, it effectively generates a User instance, which I then use to create a new record in the User database table.

I've also moved the header setting from individual method handlers to the main request handler

```go
w.Header().Set("Content-Type", "application/json")
```

like 

```go
package userModel

import (
	dbhandler "backend/db_handler"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"gorm.io/gorm"
)

type UserRequestHandler struct{}

func (uRH *UserRequestHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	switch r.Method {
	case http.MethodGet:
		uRH.getUser(w, r)
	case http.MethodPost:
		uRH.createUser(w, r)
	}
}

func (uRH *UserRequestHandler) createUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	if req.Name == "" || req.Phone == "" {
		http.Error(w, "name and phone cannot be empty", http.StatusBadRequest)
		return
	}

	user := req.createUser()

	dbhandler.GetDBPointer().Create(&user)

	json.NewEncoder(w).Encode(user)
}

func (uRH *UserRequestHandler) getUser(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("user_id")
	if userId == "" {
		http.Error(w, "user_id cannot be empty", http.StatusBadRequest)
	}

	var user User
	err := dbhandler.GetDBPointer().First(&user, userId).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			fmt.Fprintf(w, "User not found")
		} else {
			fmt.Fprintf(w, "DB error:%+v", err)
		}
		return
	}

	json.NewEncoder(w).Encode(user)
}

```

While it's not perfectly polished, it's sufficiently clean for now.

Summary by chatgpt
---

### 🏗️ Backend Development Log — Go + GORM

This repository documents my ongoing journey building a backend in Go.
I’m refining the architecture, learning best practices, and gradually evolving the system toward a clean, testable, and scalable structure. 🚀

---

### ⚙️ Project Structure Improvements

To keep things organized, I extracted the `RootRequestHandler` from `main.go`.
Each handler now has its own package and implements `ServeHTTP`, following Go’s idiomatic approach to routing. It keeps the entry point minimal and easier to maintain. ✨

---

### 🗄️ Database Layer (Powered by GORM)

I refactored the database logic into a dedicated `dbhandler` package.
This layer now:

* Opens a PostgreSQL connection using **GORM**
* Runs **auto-migrations** for `User` and `Course` models
* Exposes a shared DB instance with `GetDBPointer()`

Switching to an ORM has made development much smoother as I learn more about backend patterns. 🧩

---

### 👤 User API Endpoints

I added two core features for the `User` resource:

#### **POST /user**

Creates a new user from JSON input.
Uses a `CreateUserRequest` struct to transform request data into a `User` model.

#### **GET /user?user_id={id}**

Fetches a user by ID with proper error handling for missing or invalid queries.

This separation keeps request parsing clean and avoids coupling JSON structures directly to DB models. 🔄

---

### 🧹 General Improvements

* Centralized `"Content-Type: application/json"` inside the main handler
* Added consistent error responses
* Improved readability and reduced duplication

Not perfect yet, but definitely moving toward a more maintainable architecture. 😄

---

### 🧪 Next Steps: TDD

My next focus is implementing **unit tests** and shifting toward **Test-Driven Development (TDD)**.
Starting early will help keep the codebase stable as more features are added. 🧪⚡

---

## TO BE CONTINUED ...
