// 整个 public 目录中的资源都允许被访问

// 把当前模块所有的依赖项都声明在模块最上方
let http = require('http')
let fs = require('fs')
let url = require('url')  //  为了使用 url.parse 方法将路径解析为一个方便操作的对象
let template = require('art-template')  // 模板引擎（记得在项目内 npm install art-template）

let comments = [
  {
    name: '淡漠',
    message: '前端加油!',
    dateTime: '2021.3.7 22:59:41'
  },
  {
    name: '和谐创新',
    message: '前端加油!',
    dateTime: '2021.3.6 12:37:07'
  },
  {
    name: '峻哥',
    message: '前端加油!',
    dateTime: '2021.3.5 08:45:23'
  },
  {
    name: '婷婷',
    message: '前端加油!',
    dateTime: '2021.3.4 18:05:11'
  }
]

http
  .createServer(function (req, res) {
    // 简写方式，该函数会直接被注册为 server 的 request 请求事件处理函数
    // 使用 url.parse 方法将路径解析为一个方便操作的对象，第二个参数为 true 表示直接将查询字符串转为一个对象（通过 query 属性来访问）
    let parseObj = url.parse(req.url, true)

    // 单独获取不包含查询字符串的路径部分（该路径不包含 ? 之后的内容）
    let pathname = parseObj.pathname

    if (pathname === '/') {
      fs.readFile('./views/index.html', function (err, data) {
        if (err) {
          return res.end('404 Not Found.')
        }
        let htmlStr = template.render(data.toString(), {
          // 使用模板引擎渲染
          comments: comments
        })
        res.end(htmlStr)
      })
    } else if (pathname === '/post') {
      fs.readFile('./views/post.html', function (err, data) {
        if (err) {
          return res.end('404 Not Found.')
        }
        res.end(data)
      })
    } else if (pathname.indexOf('/public/') === 0) {
      // 统一处理：
      //    如果请求路径是以 /public/ 开头的，则认为要获取 public 中的某个资源
      //    所以我们就直接可以把请求路径当作文件路径来直接进行读取
      fs.readFile('.' + pathname, function (err, data) {
        if (err) {
          return res.end('404 Not Found.')
        }
        res.end(data)
      })
    } else if (pathname === '/pinglun') {
      // 接下来要做的就是：
      //    1. 获取表单提交的数据 parseObj.query
      //    2. 将当前时间日期添加到数据对象中，然后存储到数组中
      //    3. 让用户重定向跳转到首页 /
      //       当用户重新请求 / 的时候，数组中的数据已经发生变化了，所以用户看到的页面也就变了

      let comment = parseObj.query  //(完成第一步)

      function todayTime () {
        let date = new Date()
        let day = date.getDate()
        let mon = date.getMonth() + 1
        let year = date.getFullYear()
        let hour = date.getHours()
        let min = date.getMinutes()
        let sec = date.getSeconds()
        if (min < 10) {
          min = '0' + min 
        }
        if (sec < 10) {
          sec = '0' + sec
        }
        let time = year + '.' + mon + '.' + day + ' ' + hour + ':' + min + ':' + sec 
        return time 
      }
      comment.dateTime = todayTime()

      comments.unshift(comment) //将一个或多个元素添加到数组的开头，并返回该数组的新长度（完成第二步）

      // 如何通过服务器让客户端重定向：
      //    1. 状态码设置为 302 临时重定向
      //        statusCode
      //    2. 在响应头中通过 Location 告诉客户端往哪儿重定向
      //        setHeader
      // 如果客户端发现收到服务器的响应的状态码是 302 就会自动去响应头中找 Location ，然后对该地址发起新的请求
      // 所以能看到客户端自动跳转

      res.statusCode = 302  //（完成第三步）
      res.setHeader('Location', '/')
      res.end()
    } else {
      // 其它的都处理成 404 找不到
      fs.readFile('./views/404.html', function (err, data) {
        if (err) {
          return res.end('404 Not Found.')
        }
        res.end(data)
      })
    }
  })
  .listen(3000, function () {
    console.log('服务器启动成功，可以通过 http://127.0.0.1:3000/ 来进行访问')
  })

