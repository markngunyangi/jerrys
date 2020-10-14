exports.getIndex = (req, res, next) => {
    res.render('site/index', {
        title: 'JTT',
        path: '/'
    });
}

exports.getAbout = (req, res, next) => {
    res.render('site/about', {
        title: 'About Me',
        path: '/about'
    });
}

exports.getContacts = (req, res, next) => {
    res.render('site/contacts', {
        title: 'Contact Me',
        path: '/contacts'
    });
}

exports.getSamples = (req, res, next) => {
    res.render('site/samples', {
        title: 'Samples',
        path: '/samples'
    });
}

exports.getFAQ = (req, res, next) => {
    res.render('site/faq', {
        title: 'F.A.Q',
        path: '/faq'
    });
}

exports.getSales = (req, res, next) => {
    res.render('site/sales', {
        title: 'Write My Paper',
        path: '/sales'
    });
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

exports.getGurantee = (req, res, next) => {
    res.render('site/gurantee', {
        title: 'MoneyBack gurantee',
        path: '/gurantee'
    });
}