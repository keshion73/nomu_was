
const config = require('./config.env')

const request = require('request');
const express = require('express')
const vhost = require("vhost")
//var session = require('express-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
// var url = require('url')
const helmet = require('helmet')

// var fs = require('fs')
const path = require('path')

// var multiparty = require('multiparty')
// var uuid = require('node-uuid')
// var mime = require('mime')
// var excel = require('exceljs')

const secure = require('./auth/secure.js')
const commonDef = require('../rest_nomu/common/commonDef.js')

let app = express();

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');
// static 파일 폴더 권한주기
app.use(express.static(path.join(__dirname, 'public')))

app.use(cookieParser())

// 보안 이슈 
// TODO: 현재 스크립트 동작 때문에 contentSecurityPolicy false 로 뒀다. 추후 만약 정리가 되면 보안 속성 적용.
//app.use(helmet())
//app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

// ajax 크로스 도메인 문제 때문에.
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*")
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next()
});

// configuration
//app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
app.use(bodyParser.json({ limit: config.server.limit_json }));
app.use(bodyParser.urlencoded({ limit: config.server.limit_url, extended: true }));

//console.log(bodyParser);

app.use(express.urlencoded({ limit: config.server.limit_url, extended: false }))
app.use(express.json({ limit: config.server.limit_json }))


////////////////////////////////////////////////////////////////////////////////////////////////
// 토큰 미들웨어.
let isExistToken = (req, res, next) => {
    if (typeof req.nomu === 'undefined') {
        return false
    }

    return true
}
app.get('*', (req, res, next) => {
    console.log("[TOKEN_CHECK]\n" + config.path.was + req.url.slice(1))

    // TODO: download, excel 등 폴더 추가. ( 담부턴 걍 public 등 폴더를 하나 두자.. ) // public 중에 파일 쪽은 접근하지 않는다..
    if (req.url.startsWith('/assets/') || req.url.startsWith('/sass/')) {
        next()
        return
    }
    let token = req.cookies.nomu_sid

    if (token == '' || typeof token === 'undefined') {
        next()
        return
    }
    try {
        let decoded = secure.readAndCheckToken(token)

        // TODO: 여기서 만료 체크해서 만료 되었으면 재발급. 
        // 단, 재발급 API 에서 탈퇴, 권한 이탈 등 여부 꼭 체크해서 재발급 해야 한다.

        if (decoded.status == 'success') {
            let tokenObj = secure.decrypt(decoded.objString);
            tokenObj = JSON.parse(tokenObj)
            tokenObj.token = token
            tokenObj.common = commonDef
            req.nomu = tokenObj

            next()
            return
        } else {
            next()
            return
        }
    } catch (e) {
        console.log("ERROR : " + e)
        next()
        return
    }
})
app.post('*', (req, res, next) => {
    // TODO: 토큰 코드 중복 ( get/post ) 정리 필요.
    console.log("[TOKEN_CHECK]\n" + config.path.was + req.url.slice(1))

    // TODO: download, excel 등 폴더 추가. ( 담부턴 걍 public 등 폴더를 하나 두자.. ) // public 중에 파일 쪽은 접근하지 않는다..
    if (req.url.startsWith('/assets/') || req.url.startsWith('/sass/')) {
        next()
        return
    }
    let token = req.cookies.nomu_sid

    if (token == '' || typeof token === 'undefined') {
        next()
        return
    }
    try {
        let decoded = secure.readAndCheckToken(token)

        // TODO: 여기서 만료 체크해서 만료 되었으면 재발급. 
        // 단, 재발급 API 에서 탈퇴, 권한 이탈 등 여부 꼭 체크해서 재발급 해야 한다.

        if (decoded.status == 'success') {
            let tokenObj = secure.decrypt(decoded.objString);
            tokenObj = JSON.parse(tokenObj)
            tokenObj.token = token
            tokenObj.common = commonDef
            req.nomu = tokenObj

            next()
            return
        } else {
            next()
            return
        }
    } catch (e) {
        console.log("ERROR : " + e)
        next()
        return
    }
})
////////////////////////////////////////////////////////////////////////////////////////////////
// 라우터 설정.
app.get('/pdf', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    res.render('pdf');
})
app.get('/login', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    let savedId = req.cookies.uid
    let autoLogin = req.cookies.autoLogin
    console.log("[login_info] : " + "savedId: " + savedId + " " + "autoLogin: " + autoLogin)

    if (autoLogin == "1") {
        res.redirect('main')
    } else {
        res.render('login', { nomu: { token: "" }, savedId: savedId, autoLogin: autoLogin, config: config });
    }
})
app.post('/contract', function (req, res) {
    console.log(config.path.was + req.url.slice(1))
    let body = req.body;

    res.render('contract', { nomu: req.nomu, config: config, data: body });
})
app.post('/daily_contract', function (req, res) {
    console.log(config.path.was + req.url.slice(1))
    let body = req.body;

    res.render('daily_contract', { nomu: req.nomu, config: config, data: body });
})
app.post('/contractFormScheduleContainer', function (req, res) {
    console.log(config.path.was + req.url.slice(1))
    let schedules = req.body.schedules
    let isDaily = req.body.isDaily

    console.log(JSON.stringify(schedules))
    console.log(req.nomu)

    res.render('contractFormScheduleContainer', { isDaily: isDaily, schedules: schedules, nomu: req.nomu });
})
// // TODO: 제거.
// app.get('/contractFormSchedule', function (req,res) {
//     console.log( config.path.was + req.url.slice(1) )
//     const index = Number(req.query.index)
//     const isTop = index == 0
//     const type = Number(req.query.type)

//     console.log( type )

//     res.render('contractFormSchedule',{ isTop: isTop, index: index, type: type, nomu: req.nomu } );
// })
app.post('/contractFormBenefit', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    let body = req.body;
    let benefits = body.benefits
    let basicCount = body.necessoryCount

    res.render('contractFormBenefit', { benefits: benefits, basicCount: basicCount, nomu: req.nomu });
})
app.get('/contractFormSelf', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    res.render('contractFormSelf', { nomu: req.nomu, config: config });
})
app.get('/contractFormDaily', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    res.render('contractFormDaily', { nomu: req.nomu, config: config });
})
app.get('/contractFormRegular', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    res.render('contractFormRegular', { nomu: req.nomu, config: config });
})
app.get('/companyDetailContent', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    res.render('companyDetailContent', { nomu: req.nomu, config: config });
})
app.get('/main', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    if (isExistToken(req, res, null) == false) {
        res.redirect('login')
        return
    }

    console.log("render main")
    res.render('main', { nomu: req.nomu, config: config });
})
app.get('/manageCompany', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    if (isExistToken(req, res, null) == false) {
        res.redirect('noAuth')
        return
    }

    if (req.nomu.user.user_type != 0) {
        res.redirect('noAuth')
        return
    }

    res.render('manageCompany', { nomu: req.nomu, config: config });
})
app.get('/workerList', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    res.render('workerList', { nomu: req.nomu, config: config });
})
app.get('/contractList', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    res.render('contractList', { nomu: req.nomu, config: config });
})
// 작업 끝나면 제거 필요.
app.post('/payroll', function (req, res) {
    console.log(config.path.was + req.url.slice(1))
    let body = req.body;
    console.log(JSON.stringify(req.nomu))

    res.render('payroll', { nomu: req.nomu, config: config, data: body });
})
app.get('/payrollBookkeeper', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    res.render('payrollBookkeeper', { nomu: req.nomu, config: config });
})
app.get('/laborBookkeeper', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    res.render('laborBookkeeper', { nomu: req.nomu, config: config });
})
app.get('/dayOffBookkeeper', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    res.render('dayOffBookkeeper', { nomu: req.nomu, config: config });
})
app.get('/majorInsurance', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    res.render('majorInsurance', { nomu: req.nomu, config: config });
})
app.get('/downloadForms', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    res.render('downloadForms', { nomu: req.nomu, config: config });
})
app.get('/signOut', (req, res, next) => {
    console.log(config.path.was + req.url.slice(1))

    res.cookie("nomu_sid", "")
    res.cookie("autoLogin", "0")
    res.redirect('login')
})
app.get('/noAuth', (req, res, next) => {
    console.log(config.path.was + req.url.slice(1))

    res.render('noAuth', { nomu: req.nomu, config: config });
})
app.get('/private', function (req, res) {
    console.log(config.path.was + req.url.slice(1))

    res.render('privateForm', { nomu: req.nomu, config: config });
})
////////////////////////////////////////////////////////////////////////////////////////////////
// 404
app.get('*', (req, res, next) => {
    console.log("[404_CHECK] \n" + config.path.was + req.url.slice(1))

    // TODO: download, excel 등 폴더 추가. ( 담부턴 걍 public 등 폴더를 하나 두자.. ) // public 중에 파일 쪽은 접근하지 않는다..
    if (req.url.startsWith('/assets') || req.url.startsWith('/sass')) {
        next()
        return
    }
    let token = req.cookies.nomu_sid

    if (token == '' || typeof token === 'undefined') {
        res.redirect('login')
        return
    }
    try {
        let decoded = secure.readAndCheckToken(token)

        if (decoded.status == 'success') {
            console.log("to main")
            res.redirect('main')
        } else {
            console.log("to login")
            res.redirect('login')
        }
    } catch (e) {
        //console.log( "ERROR : " + e )
        res.redirect('login')
    }
})

// 프로세스 죽음 방지.
process.on('uncaughtException', function (err) {
    console.log(err.stack)
    console.log('Caught exception: ' + err)
    // 추후 trace를 하게 위해서 err.stack 을 사용하여 logging하시기 바랍니다.
    // Published story에서 beautifule logging winston 참조
    //var result = common.getDefaultResult();

    // TODO: 메일 발송.
    request.post(config.path.rest + 'v1/log/exception', { exception: err },
        (error, response, body) => {
            if (!error && response.statusCode == 200) {
            } else {
                console.log("failed email")
            }
        }
    );
});

app.set('port', config.server.port)
// listen

console.log(config)
const greenlock = require('greenlock-express')

if (process.env.NODE_ENV === 'production') {
    greenlock.init({
        packageRoot: __dirname,
        configDir: './greenlock.d',
        // TODO: 추후 env로 옮김
        maintainerEmail: 'pilsung0@gmail.com'
    }).serve(app)
} else {
    let server = app.listen(app.get('port'), function () {
        console.log("Listening on port " + app.get('port'))
    })
}

module.exports = app
