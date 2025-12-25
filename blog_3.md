### November 28, 2025 – 10:39 PM  

Okay, so it’s been a while since I last wrote Go for this project. Honestly, I’ve basically forgotten everything I learned so far. The app side has gained some momentum, but my progress in Go? Pretty much wiped clean.  

As a SWE, I guess this kind of thing happens sometimes (take it with a grain of salt!).  

I’m going to go over all the progress I made—both on record and off record—and see if my notes are actually worth anything. If not, this blog will stay unpublished. And if you’re reading this, then congrats, it worked!  

---

I started by reading [blog_1](https://momin-mostafa.github.io/blog-go-novice/blog_1.html), which was about creating a RESTful API endpoint.  

But I ran into some issues with my own blog. The websites I generated through ChatGPT aren’t consistent. There’s no navigation between blogs, and no listing of posts. Time for some “vibe coding” for the HTML part—because honestly, I hate doing boring stuff like this. Later, when I have more blogs, I might clean it up and make it look professional. For now, the blog site isn’t a priority.  

---

### November 28, 2025 – 11:20 PM  

I’m already three coffees in, and I haven’t made any real progress yet. I’ve mostly been fixing the website to make it readable—for you guys, my imaginary audience!  

After struggling with AI, I cleaned things up a bit. I removed 37 lines, added 4 lines, and now all my pages have a consistent look.  

---

### November 29, 2025 – 12:13 AM  

Updated the blogging site one last time. It’s more reader-friendly now.  

After reading the first two blogs, I decided it’s time to focus on writing test cases to test API endpoints and their behavior.  

---

### November 29, 2025 – 5:59 AM  

I promised myself to focus on testing, so that’s exactly what I did. I started with the course module as my first testing ground and wrote some prompts to generate initial test cases.  

When I started the project, I wasn’t sure how the app would look or which fields I would need. So, I had to refactor the course module—that’s why I chose it.  

Along the way, I discovered a new package: [`go-sqlmock`](https://github.com/DATA-DOG/go-sqlmock). It lets me mock the database, so I can write proper unit tests. It took me a while to figure out the best way to test things.  

Here’s a snippet:  

```go
db, mock, err := sqlmock.New()
if err != nil {
    t.Fatalf("failed to open sqlmock database: %s", err)
}
defer db.Close()

rows := sqlmock.NewRows([]string{"id", "name"}).
    AddRow(1, "Go Basics").
    AddRow(2, "Advanced Go")

mock.ExpectQuery("SELECT \\\\* FROM courses").
    WillReturnRows(rows)
```

I created a helper file `mock_db_test.go` to set up and tear down the mock DB:

```go
package test

import (
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func setupMockDB(t *testing.T) (*gorm.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}

	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn: db,
	}), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open gorm db: %v", err)
	}

	return gormDB, mock
}

func closeDB(db *gorm.DB) {
	sqlDB, _ := db.DB()
	defer sqlDB.Close()
}
```

Using this helper, I wrote tests for `CourseRequestHandler`. The basic idea is mocking queries and verifying that the responses match expectations. For example, here’s a simple GET test:

```go
func TestGetAllCourses_GroupAndTeacher(t *testing.T) {
	db, mock := setupMockDB(t)
	defer closeDB(db)

	rows := sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "teacher_id", "classroom_code", "group"}).
		AddRow(1, time.Now(), time.Now(), nil, 10, "101", "A")

	mock.ExpectQuery(`SELECT \* FROM "courses" WHERE \("courses"\."teacher_id" = \$1 AND "courses"\."group" = \$2\) AND "courses"\."deleted_at" IS NULL`).
		WithArgs(uint(10), "A").
		WillReturnRows(rows)

	req := httptest.NewRequest("GET", "/course?group=A&teacher_id=10", nil)
	rr := httptest.NewRecorder()

	handler := &coursemodel.CourseRequestHandler{}
	handler.GetAllCourses(req, rr, db)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rr.Code)
	}

	var courses []coursemodel.Course
	if err := json.NewDecoder(rr.Body).Decode(&courses); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if len(courses) != 1 {
		t.Errorf("expected 1 course, got %d", len(courses))
	}
}
```

I also wrote POST tests for creating courses.

---

### Lessons Learned

1. **Mocking the Database**: `go-sqlmock` is a lifesaver for unit testing without touching real data.
2. **Structs for Separation of Concerns**:

   * `User` → internal server representation
   * `UserResponse` → what we send to clients (hides sensitive fields like passwords)
   * `CreateUserRequest` → what we receive from clients

Example:

```go
type UserResponse struct {
	ID             uint   `json:"id"`
	FullName       string `json:"full_name"`
	Phone          string `json:"phone"`
	StudentID      string `json:"student_id"`
	PersonalEmail  string `json:"personal_email"`
	UnivesityEmail string `json:"university_email"`
}

func (user User) toResponse() UserResponse {
	return UserResponse{
		ID:             user.ID,
		FullName:       user.FullName,
		Phone:          user.Phone,
		StudentID:      user.StudentID,
		PersonalEmail:  user.PersonalEmail,
		UnivesityEmail: user.UnivesityEmail,
	}
}
```

For requests, we now have:

```go
type UserRequest struct {
	FullName       string `json:"full_name"`
	Phone          string `json:"phone"`
	StudentID      string `json:"student_id"`
	PersonalEmail  string `json:"personal_email"`
	HashedPassword string `json:"password"`
	UnivesityEmail string `json:"university_email"`
}

func (req *UserRequest) createUser() User {
	return User{
		FullName:       req.FullName,
		Phone:          req.Phone,
		StudentID:      req.StudentID,
		PersonalEmail:  req.PersonalEmail,
		HashedPassword: req.HashedPassword,
		UnivesityEmail: req.UnivesityEmail,
	}
}
```

---

### Today’s Takeaways

* Learned to **mock the database** for proper unit testing.
* Introduced three separate structs: **User**, **UserResponse**, and **UserRequest** for better separation of concerns.
* Wrote unit tests for both **Course** and **User** modules.

