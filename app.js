var createError = require('http-errors');
var express = require('express');
var cors = require('cors')
var bodyParser = require('body-parser')
var expressLayouts = require('express-ejs-layouts');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');

var indexRouter = require('./routes/front');
// var usersRouter = require('./routes/users');
// var googleRouter = require('./routes/google');
var adminRouter = require('./routes/admin');
var categoryRouter = require('./routes/admin/categories');
var groupRouter = require('./routes/admin/groups');
var brandRouter = require('./routes/admin/brands');
var taxRouter = require('./routes/admin/taxes');
var accountRouter = require('./routes/admin/accounts');
var companyRouter = require('./routes/admin/companies');
var stateRouter = require('./routes/admin/states');
var cityRouter = require('./routes/admin/cities');
var unitRouter = require('./routes/admin/units');
var itemsRouter = require('./routes/admin/items');
var finishedItemsRouter = require('./routes/admin/finished_items');
var stocksRouter = require('./routes/admin/stocks');
var purchasesRouter = require('./routes/admin/purchases');
var productionsRouter = require('./routes/admin/productions');
var invoicesRouter = require('./routes/admin/invoices');
var usersRouter = require('./routes/admin/users');
var paymentsRouter = require('./routes/admin/payments');
var paymentModesRouter = require('./routes/admin/payment_modes');
var rolesRouter = require('./routes/admin/roles');
var paymentsReceivedRouter = require('./routes/admin/payments_received');
var loginRouter = require('./routes/admin/login');
var logoutRouter = require('./routes/admin/logout');
var flash = require('express-flash');
const session = require('express-session');
var sessionStore = new session.MemoryStore;
var app = express();
app.use(cors());
require('./middlewares/passport')(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set("layout extractScripts", true);
app.use(expressLayouts);

// app.use(logger('dev'));
// app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  cookie: {},
  store: sessionStore,
  saveUninitialized: true,
  resave: true,
  secret: '$%^&*(107%G^HF%&367sfdlf675$%*)(!MNVC'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use(function(req, res, next){
  // if there's a flash message in the session request, make it available in the response, then delete it
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
  // console.log(res.locals)
  next();
});


// app.use('/google', googleRouter);
// app.use('/admin', adminRouter);
app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/admin/login', loginRouter);
app.use('/admin/logout', logoutRouter);
app.use('/admin/categories', categoryRouter);
app.use('/admin/groups', groupRouter);
app.use('/admin/brands', brandRouter);
app.use('/admin/taxes', taxRouter);
app.use('/admin/accounts', accountRouter);
app.use('/admin/companies', companyRouter);
app.use('/admin/states', stateRouter);
app.use('/admin/cities', cityRouter);
app.use('/admin/units', unitRouter);
app.use('/admin/items', itemsRouter);
app.use('/admin/finished_items', finishedItemsRouter);
app.use('/admin/stocks', stocksRouter);
app.use('/admin/purchases', purchasesRouter);
app.use('/admin/productions', productionsRouter);
app.use('/admin/invoices', invoicesRouter);
app.use('/admin/users', usersRouter);
app.use('/admin/payments', paymentsRouter);
app.use('/admin/payment_modes', paymentModesRouter);
app.use('/admin/roles', rolesRouter);
app.use('/admin/payments_received', paymentsReceivedRouter);
// 

// start socket server
// const http = require('http').createServer(app);
// const io = require('socket.io')(http)
// io.on('connection', (socket) => {
//   socket.on('chat message', (msg) => {
//     console.log('message: ' , msg);
//     io.emit('chat message', msg);
//   });
// });
// app.get('/socket', function(req, res, next) {
//     var id = req.params.sessionId;
//     console.log("iddddddddd", id, req.params);
//   // res.render('admin/'+viewDirectory + '/socket.ejs');
//     res.render('admin/accounts/socket', {layout:false });
// });
// http.listen(3001, () => {
//   console.log('listening on *:3001');
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  console.log(err)
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
