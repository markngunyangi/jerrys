const Project = require("../models/Project");
const Messages = require("../models/Messages");
const Testimonial = require("../models/Testimonial");
const Chatroom = require("../models/Chatroom");
const User = require("../models/User");
const crypto = require("crypto");
const testimonialUtils = require('../utils/testmonials');
const {
    response
} = require("express");

exports.getDashboard = (req, res, next) => {
    const user = req.user;
    let projects;
    let messages;
    Project
        .find({
            ownerId: user.id
        })
        .then((project) => {
            return project;
        })
        .then((result) => {
            projects = result;
            let review = 0;
            for (let i = 0; i < projects.length; i++) {
                review += projects[i].Review;
            }
            review = review / projects.length;
            if (isNaN(review)) {
                review = 0
            }
            // console.log(review);
            res.render("user/dashboard", {
                title: "My dashboard",
                path: "/dashboard",
                user: user,
                projects: projects.length,
                review: review
            });
        })
};

exports.getDashboardChat = (req, res, next) => {
    const user = req.user;
    let contacts = [];
    let contactsid;
    Chatroom
        .find()
        .then(async (chatrooms) => {
            for (let i = 0; i < chatrooms.length; i++) {
                if (`${req.user.id}` !== `${chatrooms[i].userId}`) {
                    contactsid = chatrooms[i].userId;
                } else {
                    contactsid = chatrooms[i].user2Id;
                }
                const user = await User.findById(contactsid);
                contacts.push(user);
            }
            res.render("user/chat", {
                title: "Chat",
                path: "/dash/chat",
                user: user,
                chatrooms,
                contacts
            });
        })
};

exports.getDashboardChatRoom = async (req, res, next) => {
    const user = req.user;
    let contacts = [];
    let contactsid;
    const userRoomId = req.params.chatRoom;
    const userRoom = await Chatroom.findById(userRoomId);
    let otherUser;
    Chatroom
        .find()
        .then(async (chatrooms) => {
            for (let i = 0; i < chatrooms.length; i++) {
                if (`${req.user.id}` !== `${chatrooms[i].userId}`) {
                    contactsid = chatrooms[i].userId;
                } else {
                    contactsid = chatrooms[i].user2Id;
                }
                const user = await User.findById(contactsid);
                contacts.push(user);
            }
            if (`${req.user.id}` === `${userRoom.userId}`) {
                otherUser = await User.findById(userRoom.user2Id);
            } else {
                otherUser = await User.findById(userRoom.userId);
            }
            res.render("user/chatuser", {
                title: "Chat",
                path: "/dash/chatRoom",
                user: user,
                chatrooms,
                contacts,
                userRoom,
                otherUser,
                userRoomId
            });
        })
};

exports.postMessage = (req, res, next) => {
    let chatRoom = req.params.chatRoom;
    res.redirect(`/chat/${chatRoom}`);
}

exports.getDashboardNewProjects = (req, res, next) => {
    const user = req.user;
    res.render("user/new-project", {
        title: "Projects",
        path: "/projects-newProject",
        user: user,
    });
};

exports.getProjects = async (req, res, next) => {
    const user = req.user;
    const projects = await Project
        .find()
        .populate('ownerId')
    for (let i = 0; i < projects.length; i++) {
        projects[i] = projects[i].toObject();
    }
    res.render("user/projects", {
        title: "Projects",
        path: "/projects",
        user: user,
        projects: projects
    });
    //console.log(user.username);
};

exports.getProject = (req, res, next) => {
    const user = req.user;
    res.render("user/project", {
        title: "Projects",
        path: "/projects",
        user: user,
    });
};

exports.getDashboardTestimonials = async (req, res, next) => {
    const user = req.user;
    let testimonialz;
    if (user.accountType == '5f971a68421e6d53753718c5') {
        testimonialz = await Testimonial.find().populate('owner')
    } else {
        testimonialz = await Testimonial.find({
            owner: user.id
        }).populate('owner')
    }
    res.render("user/content-testimonials", {
        title: "Content",
        path: "/content-testimonials",
        user: user,
        testimonials: testimonialz
    });
};

exports.postAddTestimonail = (req, res, next) => {
    const user = req.user;
    const testimonial = req.body.testimonial;
    const newTestimonial = new Testimonial({
        text: testimonial,
        owner: user.id,
    })
    newTestimonial
        .save()
        .then((result) => {
            res.redirect('/content-testimonials')
        });
};

exports.postPublishTestimonial = async (req, res, next) => {
    let publishedTestimonials = await Testimonial.find({
        published: true
    })
    let testimony = await Testimonial.findOne({
        _id: req.body.testimonialId
    })
    if (testimony.published === true) {
        testimony.published = false;
    } else {
        testimony.published = true;
    }
    await testimony.save();
    res.redirect('/content-testimonials');
};

exports.postDeleteTestimonial = (req, res, next) => {
    Testimonial
        .findByIdAndDelete(req.body.testimonialId)
        .then((result) => {
            res.redirect('/content-testimonials')
        })
};