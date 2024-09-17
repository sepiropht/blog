---
weight: 10
title: 'Between Rust and Go, I Choose V'
image: 'img/post3.webp'
date: 2024-09-17T04:11:38.315Z
description: 'Introduction to the V language and a brief comparison with Go/Rust in terms of performance and simplicity'
tags: ['rust', 'go', 'v']
type: post
showTableOfContents: true
draft: false
---

I've known about V for quite a few years, and I admit I had stopped following the language's development for some time. It's a language that promises a lot, almost seeming too good to be true. The simplicity of a dynamic language, with a Go-like syntax (but [better](https://github.com/vlang/v/wiki/V-for-Go-developers)), yet with performance comparable to [C/C++/Rust](https://vlang.io/compare) while maintaining good [compilation speed](https://vlang.io/compilation_speed).

```v
println('hello world!')
```

It's hard to get simpler than that. In a real program, however, we'll have the classic main entry point:

```v
fn main () {
    println('hello world!')
}
```

The overall syntax of V is very similar to Go's, so it's said that 80% of Go can be found in V. Personally, I'm not a fan of Go's syntax, but that's purely aesthetic, and we must admit, this simplicity is damn effective and constitutes a strength of the language compared to the complexity of Rust.

Speaking of Rust, V had the good idea of borrowing the functional style of the language, which means we can write Rust-like code like this with the famous match to decompose an enum:

```v
enum Color {
    red
    blue
    green
}

fn is_red_or_blue(c Color) bool {
    return match c {
        .red, .blue { true } // comma can be used to test multiple values
        .green { false }
    }
}
```

Or the traditional map/filter that I've known since Node.js and can't live without, which I miss so much when I'm doing Go:

```v
// using filter, map and negatives array slices
files := ['pippo.jpg', '01.bmp', '.v.txt', 'img_02.jpg', 'img_01.JPG']
filtered := files.filter(it[-4..].to_lower() == '.jpg').map(it.to_upper())
// ['PIPPO.JPG', 'IMG_02.JPG', 'IMG_01.JPG']
```

Another good idea borrowed from Rust that appears in this language is the Option/Result type.

```v
struct User {
    id   int
    name string
}

struct Repo {
    users []User
}

fn (r Repo) find_user_by_id(id int) !User {
    for user in r.users {
        if user.id == id {
            // V automatically wraps this into a result or option type
            return user
        }
    }
    return error('User ${id} not found')
}

// A version of the function using an option
fn (r Repo) find_user_by_id2(id int) ?User {
    for user in r.users {
        if user.id == id {
            return user
        }
    }
    return none
}

fn main() {
    repo := Repo{
        users: [User{1, 'Andrew'}, User{2, 'Bob'}, User{10, 'Charles'}]
    }
    user := repo.find_user_by_id(10) or { // Option/Result types must be handled by `or` block
        println(err)
        return
    }
    println(user.id)   // "10"
    println(user.name) // "Charles"

    user2 := repo.find_user_by_id2(10) or { return }

    // To create an Option var directly:
    my_optional_int := ?int(none)
    my_optional_string := ?string(none)
    my_optional_user := ?User(none)
}
```

Those who have done Rust should not be lost: `!` for the `result` type and `?` for the `option` type.

If the function returns a result, it returns an `error` type, while if it returns an option, it returns a `none`.
And when calling a function that returns these types, we must obligatorily add an `or {}` block.

Personally, I find it super elegant.

We also have other concepts like high-order functions and closures; functions are therefore first-class citizens in this language and can be treated as variables.

```v
my_int := 1
my_closure := fn [my_int] () {
    println(my_int)
}
my_closure() // prints 1
```

The language is transpiled to C, and the produced code is human-readable for those who do C. So V's promise is enormous, I think, to have this clear and simple syntax and still have C-like performance. I'm going to start following this language closely again and do some experiments. To test V, it's [here](https://vlang.io/)
