checkout this blog site : [link](https://momin-mostafa.github.io/go-novice-blog/)

# My Go Journeys

I've decided to keep a note or blog documenting my weekend explorations into different technologies. This space will serve as a personal log of how I learn something new, tackle challenges, and strive to improve my skills. By sharing my progress, I hope to reflect better on my learning journey and maybe even help others along the way.

## Go & Backend Developement

- [Getting Started with Go: Building a RESTful API Server with PostgreSQL Database Integration - A Beginner's Journey](blog_1.md)

> In this journey, I built a RESTful API server from scratch using Go, integrated it with a PostgreSQL database, and implemented routing with `ServeMux`. I explored core Go concepts like handlers, package management, and database connectivity—progressing from a beginner to building a working backend in just a few hours.

[notion](https://www.notion.so/Getting-Started-with-Go-Building-a-RESTful-API-Server-with-PostgreSQL-Database-Integration-A-Begi-2b98a248ef8e8134bcf8f3745f4d0109?source=copy_link) [this-specific-blog](https://momin-mostafa.github.io/blog-go-novice/blog_1.html) 

- [Continuation of backend development](blog_2.md)

> In this follow-up, I modularized the project by separating request and DB logic into packages. I replaced raw SQL with GORM for easier database handling and implemented GET/POST methods for user data. I also introduced an adapter-like pattern for request models and began laying the groundwork for Test-Driven Development (TDD) as I scale the backend.

[notion](https://www.notion.so/Continuation-of-backend-development-2b98a248ef8e818f9d9ed7362bd614e1?source=copy_link) [this-specific-blog](https://momin-mostafa.github.io/blog-go-novice/blog_2.html)

- [Unit Testing in Go – Mocking the Database](blog_3.md)

> In this follow-up, I modularized the project by separating request and DB logic into packages. I replaced raw SQL with GORM for easier database handling and implemented GET/POST methods for user data. I also introduced an adapter-like pattern for request models and began laying the groundwork for Test-Driven Development (TDD) as I scale the backend.

[notion](https://www.notion.so/It-s-been-a-while-2b98a248ef8e817da7f8f0a510ee4c38?source=copy_link) [this-specific-blog](https://momin-mostafa.github.io/blog-go-novice/blog_3.html)

## How to run the code 
To create executable command :  
```bash 
go build .
``` 
To run the project command : 
```bash 
go run main.go 
``` 
To run test : 
```bash
go test ./test
```

## Database Setup (PostgreSQL)

This project uses **PostgreSQL**. Follow the steps below to create the required role and databases.

## 1. Create a Database Role

Create a PostgreSQL role with login access and permission to create databases:

```sql
CREATE ROLE tamim
WITH LOGIN
PASSWORD 'tamim'
CREATEDB;
```

## 2. Create a Database Owned by the Role

Create a database named `backend` and assign ownership to the `tamim` role:

```bash
createdb backend --owner=tamim
```

## 3. Connect to the Database

Log in to PostgreSQL using the newly created role:

```bash
psql -d backend -U tamim
```

You will be prompted to enter the password.
## Notes

* Ensure PostgreSQL is installed and running.
* Run these commands as a PostgreSQL superuser (e.g., `postgres`).
* For production environments, use a strong password instead of the example provided.

```
```
