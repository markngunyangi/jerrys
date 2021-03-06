const Parameter = require("../models/Parameter");
const Faq = require("../models/Faq");
const Sample = require("../models/Samples");
const Users = require("../models/User")
const testimonialUtils = require('../utils/testmonials');
const {
    body,
    check
} = require('express-validator');
const {
    validateUser,
    signUser
} = require("../utils/auth");

const Testimonial = require("../models/Testimonial");

const {
    validationResult
} = require('express-validator');
const stripe = require("stripe")("sk_test_51HgzMMJPyNo4yUQMT58hHpGHUVN8XPFYzZLsIXKYZpBzhmy1c8unL9a9JHMNy7tUOaNkmlAkHsgy6MsDA81cXIZE00S3ddcyAm");

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'SendinBlue',
    auth: {
        user: 'jerrythewriterworks@gmail.com',
        pass: 'DzOHaZ6Ag3y7GtQn'
    }
});

exports.getIndex = async (req, res, next) => {
    res.render('site/index', {
        title: 'JTT',
        path: '/'
    });
}

exports.getAbout = async (req, res, next) => {
    testimonialUtils.publishTestimonial();
    let testimonials = await Testimonial.find({
        published: true
    }).populate('owner');
    res.render('site/about', {
        title: 'About Me',
        path: '/about',
        testimonials: testimonials
    });
}

exports.getContacts = (req, res, next) => {
    let successMessage;
    if (req.session.successContact) {
        successMessage = req.session.successContact;
        req.session.successContact = null;
    }
    res.render('site/contacts', {
        title: 'Contact Me',
        path: '/contacts',
        errorMessage: '',
        successMessage: successMessage
    });
}

exports.postContacts = (req, res, next) => {
    //console.log(req.body);
    let name = req.body.name;
    let email = req.body.email;
    let question = req.body.question;
    let questionContent = req.body.questionContent;
    if (!email || !question || !questionContent) {
        return res.status(422).render('site/contacts', {
            title: 'Contact Me',
            path: '/contacts',
            errorMessage: "Please fill all the fields"
        });
    }
    transporter
        .sendMail({
            to: 'jerrymuthomi@gmail.com',
            from: "jerrythewriterworks@gmail.com",
            subject: `An email from ${req.body.email}`,
            html: `
                    <h1>Question: ${req.body.question}</h1>
                    <p>Question content: ${req.body.questionContent}</p>
                    <br>
                    <br>
                    <small><i>This is an email sent from JTW's contacts page</i></small>
                `
        })
    transporter
        .sendMail({
            to: req.body.email,
            from: "jerrythewriterworks@gmail.com",
            subject: `Hi ${req.body.name}`,
            html: `
                    <h1>RE:JTW contact's page submission</h1>
                    <p>We've received your question and we  will get in touch with you ASAP</p> 
                `
        })
    req.session.successContact = {
        message: 'Your email has been received, we will get back to you ASAP',
        messageType: 'success'
    }
    res.redirect('/contacts');
}

exports.getSamples = async (req, res, next) => {
    let testimonials = await Testimonial.find({
        published: true
    }).populate('owner');
    //console.log(testimonials);
    Sample.find()
        .then((sampleList) => {
            res.render("site/samples", {
                samples: sampleList,
                title: "Samples",
                path: "/samples",
                testimonials: testimonials
            });
        })
        .catch((err) => {
            console.log(err)
        });
}


exports.getFAQ = (req, res, next) => {
    let searchQuery = req.params.searchQuery === 'null' ? '' : req.params.searchQuery;
    //console.log(searchQuery);
    Faq.find()
        .then((faqList) => {
            //console.log(faqList);
            res.render('site/faq', {
                faqs: faqList,
                title: 'F.A.Q',
                path: '/faq',
                searchQuery: searchQuery
            });

        })
        .catch((err) => {
            console.log(err);
        });

};

exports.getSales = async (req, res, next) => {
    let testimonials = await Testimonial.find({
        published: true
    }).populate('owner');
    res.render('site/sales', {
        title: 'Write My Paper',
        path: '/sales',
        testimonials: testimonials
    });
}

exports.getPaper = (req, res, next) => {
    const user = req.user;
    console.log(user);
    Parameter
        .find()
        .populate('category')
        .then((parameters) => {
            res.render('site/paper', {
                title: 'Write My Paper',
                path: '/paper',
                parameters: parameters,
                user: user,
                errorMessage: '',
                oldLoginInput: {
                    email: "",
                    password: "",
                    subject: "",
                    topic: "",
                    orderInstructions: "",
                    nofSources: "",
                    noOfPages: "",
                    urgency: "",
                    discountCode: "",
                    typeOfPaper: "",
                    username: "",
                    confirmPassword: "",
                    checkedSwitcher: "",
                    resources: "",
                    errorField: "",
                    agree: ""
                },
                validationErrors: []

            });
        })
}

exports.postNewPaper = async (req, res, next) => {
    //console.log(req.files);
    console.log(req.body);
    let resources = req.files;
    let user = req.user;
    const checkedSwitcher = req.body.checkedSwitcher;
    const errors = validationResult(req);
    const email = req.body.email === '@' ? '' : req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const typeOfPaper = req.body.typeOfPaper;
    const subject = req.body.subject;
    const topic = req.body.topic;
    const orderInstructions = req.body.orderInstructions.trim();
    const nofSources = req.body.nofSources;
    const urgency = req.body.urgency;
    const noOfPages = req.body.noOfPages;
    const discountCode = req.body.discountCode;
    const confirmPassword = req.body.confirmPassword;
    const service = req.body.service;
    const agree = req.body.agree;
    const telephone = req.body.full_phone;

    let parameters = await Parameter.find().populate('category');
    let mode;
    let paper = req.body;

    //if no topic as a use
    if (checkedSwitcher === 'loggedIn') {
        if (topic.length < 2) {
            resources = resources.length < 1 ? '' : 'Files already saved';
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                user: user,
                errorMessage: 'Topic should contain atleast 2 characters',
                oldLoginInput: {
                    email: email,
                    password: password,
                    subject: subject,
                    topic: topic,
                    orderInstructions: orderInstructions,
                    nofSources: nofSources,
                    noOfPages: noOfPages,
                    urgency: urgency,
                    discountCode: discountCode,
                    typeOfPaper: typeOfPaper,
                    checkedSwitcher: 'loggedIn',
                    resources: resources,
                    service: service,
                    agree: agree,
                    errorField: "topics"
                },
                validationErrors: errors.array(),
                parameters,
                user
            })
        }
        //if no order instruction as a user
        if (!orderInstructions) {
            resources = resources.length < 1 ? '' : 'Files already saved';
            console.log(errors.array());
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                user: user,
                errorMessage: 'Order Instruction should contain atleast 2 characters',
                oldLoginInput: {
                    email: email,
                    password: password,
                    subject: subject,
                    topic: topic,
                    orderInstructions: orderInstructions,
                    nofSources: nofSources,
                    noOfPages: noOfPages,
                    urgency: urgency,
                    discountCode: discountCode,
                    typeOfPaper: typeOfPaper,
                    checkedSwitcher: checkedSwitcher,
                    resources: resources,
                    service: service,
                    agree: agree,
                    errorField: "instructions"
                },
                validationErrors: errors.array(),
                parameters,
                user

            })
        }

    }

    if (checkedSwitcher === 'on') {
        mode = 'login';

        if (topic.length < 2) {
            resources = resources.length < 1 ? '' : 'Files already saved';
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: 'Topic should contain atleast 2 characters',
                oldLoginInput: {
                    email: email,
                    password: password,
                    subject: subject,
                    topic: topic,
                    orderInstructions: orderInstructions,
                    nofSources: nofSources,
                    noOfPages: noOfPages,
                    urgency: urgency,
                    discountCode: discountCode,
                    typeOfPaper: typeOfPaper,
                    checkedSwitcher: 'on',
                    resources: resources,
                    service: service,
                    agree: agree,
                    errorField: "topics"
                },
                validationErrors: errors.array(),
                parameters,
                user
            })
        }

        //if no order instructions
        if (!orderInstructions) {
            resources = resources.length < 1 ? '' : 'Files already saved';
            console.log(errors.array());
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: 'Order Instruction should contain atleast 2 characters',
                oldLoginInput: {
                    email: email,
                    password: password,
                    subject: subject,
                    topic: topic,
                    orderInstructions: orderInstructions,
                    nofSources: nofSources,
                    noOfPages: noOfPages,
                    urgency: urgency,
                    discountCode: discountCode,
                    typeOfPaper: typeOfPaper,
                    checkedSwitcher: 'on',
                    resources: resources,
                    service: service,
                    agree: agree,
                    errorField: "instructions"
                },
                validationErrors: errors.array(),
                parameters,
                user
            })
        }

        if (!errors.isEmpty()) {
            resources = resources.length < 1 ? '' : 'Files already saved';
            console.log(errors.array());
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: errors.array()[0].msg,
                oldLoginInput: {
                    email: email,
                    password: password,
                    subject: subject,
                    topic: topic,
                    orderInstructions: orderInstructions,
                    nofSources: nofSources,
                    noOfPages: noOfPages,
                    urgency: urgency,
                    discountCode: discountCode,
                    typeOfPaper: typeOfPaper,
                    checkedSwitcher: 'on',
                    resources: resources,
                    service: service,
                    agree: agree,
                    errorField: ""
                },
                validationErrors: errors.array(),
                parameters,
                user
            })
        }

        let result = await validateUser(mode, email, password)
        resources = resources.length < 1 ? '' : 'Files already saved';
        if (!result.validated) {
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: result.message,
                validationErrors: [],
                oldLoginInput: {
                    email: email,
                    password: password,
                    subject: subject,
                    topic: topic,
                    orderInstructions: orderInstructions,
                    nofSources: nofSources,
                    noOfPages: noOfPages,
                    urgency: urgency,
                    discountCode: discountCode,
                    typeOfPaper: typeOfPaper,
                    checkedSwitcher: 'on',
                    resources: resources,
                    service: service,
                    agree: agree,
                    errorField: ""
                },
                parameters,
                user
            });
        }
        req.user = result.user;
        req.session.isLoggedIn = true;
        req.session.user = result.user;
        req.session.paper = paper;
        req.session.files = resources;
        return res.redirect('/checkout');
    } else if (!checkedSwitcher || checkedSwitcher === '') {
        mode = 'signup';
        let accountType = 'client';
        let redirectPage = '/checkout';

        //if no topic
        if (topic.length < 2) {
            resources = resources.length < 1 ? '' : 'Files already saved';
            console.log(errors.array());
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: 'Topic should contain atleast 2 characters',
                oldLoginInput: {
                    email: email,
                    password: password,
                    subject: subject,
                    topic: topic,
                    orderInstructions: orderInstructions,
                    nofSources: nofSources,
                    noOfPages: noOfPages,
                    urgency: urgency,
                    discountCode: discountCode,
                    typeOfPaper: typeOfPaper,
                    checkedSwitcher: '',
                    resources: resources,
                    service: service,
                    agree: agree,
                    errorField: "topics",
                    telephone: telephone
                },
                validationErrors: errors.array(),
                parameters,
                user
            })
        }

        //if no order instructions
        if (!orderInstructions) {
            resources = resources.length < 1 ? '' : 'Files already saved';
            console.log(errors.array());
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: 'Order Instruction should contain atleast 2 characters',
                oldLoginInput: {
                    email: email,
                    password: password,
                    subject: subject,
                    topic: topic,
                    orderInstructions: orderInstructions,
                    nofSources: nofSources,
                    noOfPages: noOfPages,
                    urgency: urgency,
                    discountCode: discountCode,
                    typeOfPaper: typeOfPaper,
                    checkedSwitcher: '',
                    resources: resources,
                    service: service,
                    agree: agree,
                    errorField: "instructions",
                    telephone: telephone
                },
                validationErrors: errors.array(),
                parameters,
                user
            })
        }
        // if no username
        if (!username || username.length < 3) {
            resources = resources.length < 1 ? '' : 'Files already saved';
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: 'Your username should contain more than 2 characters',
                oldLoginInput: {
                    subject: subject,
                    topic: topic,
                    orderInstructions: orderInstructions,
                    nofSources: nofSources,
                    noOfPages: noOfPages,
                    urgency: urgency,
                    discountCode: discountCode,
                    typeOfPaper: typeOfPaper,
                    username: username,
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword,
                    checkedSwitcher: '',
                    resources: resources,
                    service: service,
                    errorField: 'password',
                    agree: agree,
                    telephone: telephone
                },
                validationErrors: errors.array(),
                parameters,
                user
            })
        }
        if (!telephone) {
            resources = resources.length < 1 ? '' : 'Files already saved';
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: 'Please input your telephone number for communication purposes',
                oldLoginInput: {
                    subject: subject,
                    topic: topic,
                    orderInstructions: orderInstructions,
                    nofSources: nofSources,
                    noOfPages: noOfPages,
                    urgency: urgency,
                    discountCode: discountCode,
                    typeOfPaper: typeOfPaper,
                    username: username,
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword,
                    checkedSwitcher: '',
                    resources: resources,
                    service: service,
                    errorField: 'telephone',
                    agree: agree,
                    telephone: telephone
                },
                validationErrors: errors.array(),
                parameters,
                user
            })
        }
        // If any errors redirect back to paper page
        if (!errors.isEmpty()) {
            resources = resources.length < 1 ? '' : 'Files already saved';
            console.log(errors.array());
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: errors.array()[0].msg,
                oldLoginInput: {
                    subject: subject,
                    topic: topic,
                    orderInstructions: orderInstructions,
                    nofSources: nofSources,
                    noOfPages: noOfPages,
                    urgency: urgency,
                    discountCode: discountCode,
                    typeOfPaper: typeOfPaper,
                    username: username,
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword,
                    checkedSwitcher: '',
                    resources: resources,
                    service: service,
                    agree: agree,
                    errorField: "",
                    telephone: telephone
                },
                validationErrors: errors.array(),
                parameters,
                user
            })
        }
        let result = await validateUser(mode, email, password, confirmPassword)
        if (!result.validated) {
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: result.message,
                oldLoginInput: {
                    subject: subject,
                    topic: topic,
                    orderInstructions: orderInstructions,
                    nofSources: nofSources,
                    noOfPages: noOfPages,
                    urgency: urgency,
                    discountCode: discountCode,
                    typeOfPaper: typeOfPaper,
                    username: username,
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword,
                    checkedSwitcher: '',
                    resources: resources,
                    service: service,
                    agree: agree,
                    errorField: "confirm password",
                    telephone: telephone
                },
                validationErrors: [],
                parameters,
                user
            })
        }
        signUser(username, email, password, telephone, accountType, redirectPage, req, res);
        req.session.paper = paper;
        req.session.files = resources;
    } else {
        //if no topic

        //if no order instructions

        try {
            req.session.paper = paper;
            req.session.files = resources;
            res.redirect("/checkout");
        } catch (error) {
            // console.log(error);
        }
    }
}

exports.getBooks = (req, res, next) => {
    res.render('site/books', {
        title: 'Guide Books',
        path: '/books'
    });
}

exports.getTerms = (req, res, next) => {
    res.render('site/terms', {
        title: 'Terms and Conditions',
        path: '/terms'
    });
}

exports.getPolicy = (req, res, next) => {
    res.render('site/policy', {
        title: 'Privacy Policy',
        path: '/policy'
    });
}

exports.getGuarantee = (req, res, next) => {
    res.render('site/guarantee', {
        title: 'MoneyBack guarantee',
        path: '/guarantee'
    });
}

exports.getAttributions = (req, res, next) => {
    res.render('site/attribution', {
        title: 'Attribution',
        path: '/attribution'
    });
}