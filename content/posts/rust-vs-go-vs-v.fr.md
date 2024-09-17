---
weight: 10
title: 'Entre Rust et Go, je choisis V'
image: 'img/post3.webp'
date: 2024-09-17T04:11:38.315Z
description: 'Presentation du language V et petit comparatif avec Go/Rust en terme de perf et de simplicité'
tags: ['rust', 'go', 'v']
type: post
showTableOfContents: true
draft: false
---

je connais v depuis pas mal d'années et j'avoue que j'avais un peu arrété de suivre le développement du language depuis quelques temps. C'est un language qui promet beaucoup, ça sembe presque trop beau pour être vrai. La simplicité d'un language dynamique, avec une syntaxe à la go (en [mieux](https://github.com/vlang/v/wiki/V-for-Go-developers)), mais avec des perfs avec la [c/c++/rust](https://vlang.io/compare) mais tout en gardant une bonne [vitesse de compilation.](https://vlang.io/compilation_speed)

```v
printeln('hello world!')
```

Difficile de faire plus simple. Dans un vrai programme toutefois on aura le classique point d'entrée main

```
fn main () {
    printeln('hello world!')
}
```

La syntaxe global de v ressemble beaucoup à celle de go, donc c'est précisé que 80% de go se retouvent dans v. Personnelement je ne suis pas fan de la syntaxe de go, mais c'est purement esthétique, et puis il faut reconnaitre, cette simplicité est sacrement efficace et constitue une force du language par rapport à la complexité de rust.

Justement en parlant de rust, v a eu la bonne idée de piquer le style fonctionnel du language, ce qui fait qu'on peut écrire du code rust like comme ceci avec le fameux match pout décomposer un enum

```
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

Ou encore le traditionnel map./filter que je connais depuis node.js et dont je ne peux plus me passer et qui me manquent tellement quand je fais du go

```v
// using filter, map and negatives array slices
files := ['pippo.jpg', '01.bmp', '.v.txt', 'img_02.jpg', 'img_01.JPG']
filtered := files.filter(it[-4..].to_lower() == '.jpg').map(it.to_upper())
// ['PIPPO.JPG', 'IMG_02.JPG', 'IMG_01.JPG']
```

Une autre bonne idéee piquée à rust et qui se retrouve dans ce language est le type Option/Result.

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

Ceux qui on fait du rust normalement ne seront pas perdu `!` pour le type `result` et `?` pour le type `otption`

Si la fonction retourne un result elle renvoie un un type `error` tandis que si elle retourne un option elle retourne un `none`.
Et quand on appele un fonction qui retourne ces types on doit onligatoirement rajouter un bloque `or {}`.

Perso je trouve super élégant.

On aussi d'autre concept comme les les high-order function et les closures, les fonctions sont donc des first-class citizen dans ce languages et peuvent être traitées commme des variables.

```v
my_int := 1
my_closure := fn [my_int] () {
    println(my_int)
}
my_closure() // prints 1
```

Le language est transpilé en c, et le code produit est human-readable pour ceux qui font du c. Donc la promesse du v est quand même érnorme je trouve, d'avoir cette syntaxe aussi claire et simple et d'avoir quand même des perfs de c. Je vais recommencer à suivre ce language de prêt et faire quelques expérimentations. Pour tester v c'est [ici](https://vlang.io/)
