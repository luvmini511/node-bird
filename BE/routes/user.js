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

router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.params.userId }})
        if (!user) res.status(403).send('유령을 팔로우 하려고 하고 있습니다')
        await user.addFollowers(req.user.id)
        res.status(200).json({ UserId: parseInt(req.params.userId, 10) })
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.params.userId }})
        if (!user) res.status(403).send('유령을 차단 하려고 하고 있습니다')
        await user.removeFollowings(req.user.id)
        res.status(200).json({ UserId: parseInt(req.params.userId, 10) })
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.delete('/:userId/unfollow', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.params.userId }})
        if (!user) res.status(403).send('유령을 언팔로우 하려고 하고 있습니다')
        await user.removeFollowers(req.user.id)
        res.status(200).json({ UserId: parseInt(req.params.userId, 10) })
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.get('/followers', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id }})
        if (!user) res.status(403).send('내 정보가 없습니다')
        const followers = await user.getFollowers()
        res.status(200).json(followers)
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.get('/followings', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id }})
        if (!user) res.status(403).send('내 정보가 없습니다')
        const followings = await user.getFollowings()
        res.status(200).json(followings)
    } catch (error) {
        console.error(error)
        next(error)
    }
})

module.exports = router