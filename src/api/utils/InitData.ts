export {};
import { User, UserNote, Product , Order} from 'api/models';
const mongoose = require('mongoose');

const PRODUCT_1 = {
  _id:new mongoose.Types.ObjectId,
  prd_code:'153169',
  name: 'LE DO VANG ( XX NAM PHI)',
  image: 'admin',
  dvt: 'kg',
  note:'CO THE LAY LE HAN QUOC'
};

const PRODUCT_2 = {
  _id:new mongoose.Types.ObjectId,
  prd_code:'1531670',
  name: 'LE DO XANH ( XX NAM PHI)',
  image: 'admin',
  dvt: 'kg',
  note:'KO THE LAY LE HAN QUOC'
};
const ADMIN_USER_1 = {
  email: 'admin1@example.com',
  role: 'admin',
  password: '1admin1',
  avatar:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQguwSGEWgYclNcRFceLDbZZydOsfj9hni-ukb0zoNWxDyX0_s4vg',
  name:'Admin 1'
};
const ADMIN_USER_2 = {
  email: 'admin2@example.com',
  role: 'admin',
  avatar:'https://previews.123rf.com/images/schummyone/schummyone1705/schummyone170501296/78748413-beautiful-girl-sexy-fitness-makes-repairs-in-a-bright-white-room.jpg',
  password: '2admin2',
  name:'Admin 2'
};

async function setup() {
  const product1 = new Product(PRODUCT_1);
  await product1.save();

  const product2 = new Product(PRODUCT_2);
  await product2.save();

  const adminUser1 = new User(ADMIN_USER_1);
  await adminUser1.save();


  const adminUser2 = new User(ADMIN_USER_2);
  await adminUser2.save();
  // console.log(adminUser1._id)
  // console.log(product2._id)
  const order1 = new Order({_id:new mongoose.Types.ObjectId,order_code:"order1", customer_id: adminUser1._id, delivery_address:"13 lam son", deliverty_time: new Date(), note:"note", productIDs: [product2._id]})
  await order1.save();

  const order2 = new Order({_id:new mongoose.Types.ObjectId,order_code:"order2", customer_id: adminUser1._id, delivery_address:"12 lam son", deliverty_time: new Date(), note:"note", productIDs: [product2._id]})
  await order2.save();
}

async function checkNewDB() {
  const adminUser1 = await User.findOne({ email: ADMIN_USER_1.email });
  if (!adminUser1) {
    console.log('- New DB detected ===> Initializing Dev Data...');
    await setup();
  } else {
    console.log('- Skip InitData');
  }
}

checkNewDB();
