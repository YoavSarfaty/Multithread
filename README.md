# Multithread
Multithread is a little JavaScript library that helps you use multiple threads in the browser.
It uses webworkers but supports nested threads (I don't know any browser that supports nested webworkers), and it has a dead simple api.

say you have a function `myFunction`, and you would like it to run in a background thread, all you need to do is use the global `multithread` function to create a new thread:

```javascript
multithread(myFunction)(myArg)
```
This will return a Promise that will be resolved once `myFunction` returns a value in the background thread, so you can use is with async/await (`myFunction` doesn't have to be a async function).

But what if `myFunction` calls some other function `otherFunction`? you can give multithread an array of all function you may call so they will be written to the webworker:

```javascript
multithread(myFunction, [otherFunction])(myArg)
```

That's it, it's as simple as that!

## Performance
![](https://yoavsarfaty.github.io/Multithread/Performance%20on%20core%20i7-8550U.svg)

You can measure the performance [in this merge sort test.](https://yoavsarfaty.github.io/Multithread/)
