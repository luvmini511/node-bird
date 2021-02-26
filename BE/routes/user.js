const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')

const { User, Post } = require('../models')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

const router = express.Router()

router.get('/', async (req, res, next) => {
    try {
        if(req.user) {
            const fullUserWithoutPassword = await User.findOne({
                Where: { id: req.user.id },
                attributes: {
                    exclude: ['password']
                },
                include: [{
                    model: Post,
                    attributes: ['id'],
                }, {
                    model: User,
                    as: 'Followings',
                    attributes: ['id'],
                }, {
                    model: User,
                    as: 'Followers',
                    attributes: ['id'],
                }]
            })
            res.status(200).json(fullUserWithoutPassword)
            return
        }
        res.status(200).json(null)
    } catch (error) {
        console.error(error)
        next(error)
    }

})

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (error, user, info) => {
        if(error) {
            console.error(error)
            return next(error)
        }
        if (info) {
            return res.status(401).send(info.reason)
        }
        return  req.login(user, async (loginError) => {
            // passport의 로그인 에러나는 경우
            if (loginError) {
                console.error(loginError)
                return next(loginError)
            }
            const fullUserWithoutPassword = await User.findOne({
                Where: { id: user.id },
                attributes: {
                    exclude: ['password']
                },
                include: [{
                    model: Post,
                    attributes: ['id'],
                }, {
                    model: User,
                    as: 'Followings',
                    attributes: ['id'],
                }, {
                    model: User,
                    as: 'Followers',
                    attributes: ['id'],
                }]
            })
            return res.status(200).json(fullUserWithoutPassword)
        })
    })(req, res, next)
})

router.post('/', isNotLoggedIn, async (req, res, next) => {
    try {
        const isExistedUser = await User.findOne({
            where : {
                email: req.body.email,
            }
        })
        if (isExistedUser) {
            // 200 성공, 300 리다이렉트, 400 클라이언트 에러, 500 서버 에
            return res.status(403).send('이미 사용중인 아이디입니다')
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 12)
        await User.create({
            email: req.body.email,
            nickname: req.body.nickname,
            password: hashedPassword,
        })
        res.status(201).send('ok')
    } catch (error) {
        console.error(error)
        next(error) // status 500임 (서버에러니까)
    }
})

router.post('/logout', isLoggedIn, (req, res) => {
    req.logout()
    req.session.destroy()
    res.send('ok')
})

router.patch('/nickname', isLoggedIn, async (req, res, next) => {
    try {
        // update(수정할 부분, 조건)
       await User.update({
           nickname: req.body.nickname,
       }, {
           where: { id: req.user.id },
       })
        res.status(200).json({ nickname: req.body.nickname })
    } catch (error) {
        console.error(error)
        next(error)
    }
})

module.exports = router