var instance = new razorpay({
    key_id: process.env.Razorpay_Key_Id,
    key_secret: process.env.Razorpay_Key_Secret,
  });
  
  
  const placeOrder = async (req, res) => {
      try {
        const id = req.session.user_id;
        const userName = await User.findOne({ _id: id });
        const address = req.body.address;
        const paymentMethod = req.body.payment;
        const cartData = await Cart.findOne({ userId: id });
        const products = cartData.products;
        const Total = parseInt(req.body.Total);
       
        
        const status = paymentMethod === 'COD' ? "placed" : "pending";
        const order = new Order({
          deliveryAddress: address,
          userId: id,
          userName: userName.name,
          paymentMethod: paymentMethod,
          products: products,
          totalAmount: Total,
          date: new Date(),
          status: status,
        });
        const orderData = await order.save();
        if(orderData){
          for(let i=0;i<products.length;i++){
            const pro = products[i].productId
            const count = products[i].count
            await Product.findByIdAndUpdate({_id:pro},{$inc:{stockQuantity:-count}})
          }
          if(order.status === 'placed'){
            await Cart.deleteOne({userId:id});
            res.json({codsuccess:true});
          }else{
            const orderId = orderData._id;
            const totalAmount = orderData.totalAmount;
            var options = {
              amount: totalAmount*100,
              currency:'INR',
              receipt:''+ orderId
            } 
  
           instance.orders.create(options,function(err,order){
            console.log(order)
              res.json({order});
            })
          }
        }else{
          res.redirect('/')
        }
      } catch (error) {
        console.log(error); 
      }
    };
    
  
  
  const verifyPayment = async (req,res)=>{
    try{
      const details = req.body
  
      
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', process.env.Razorpay_Key_Secret);
      hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
      const hmacValue = hmac.digest('hex');
    
      if(hmacValue === details.payment.razorpay_signature){
        await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{status:"placed"}});
        await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}});
        await Cart.deleteOne({userId:req.session.user_id});
        res.json({success:true});
      }else{
        await Order.findByIdAndRemove({_id:details.order.receipt});
        res.json({success:false});
      }
    }catch(error){
        console.log(error.message)
    }
  }
  


  $("#checkoutForm").submit((e) => {
    let address = $("input[name=selectAddress]:checked").val();
    let total = document.getElementById("total").innerHTML;
    let cash = $("input[name=payment]:checked").val();
    e.preventDefault();
    $.ajax({
        url: "/checkout",
        method: "post",
        data: {
            Total: total,
            address: address,
            payment:cash,
        },
        success: (response) => {
            if (response.codsuccess === true) {
                swal.fire({
                    positon: 'center',
                    icon: "success",
                    title: 'Order Placed Successfully',
                    showConfirmButton: false,
                    showCancelButton: true,
                    cancelButtonText: "Go to Shop",
                }).then((result) => {
                  if (result.dismiss === swal.DismissReason.cancel) {
                    window.location.href = "/product";
                  }
                });
            }else{
            razorpayPayment(response.order);
          }
        }
    });
  });
  
  function razorpayPayment(order){
    var options = {
      "key": "rzp_test_Fi6xAYymt9QpSY", // Enter the Key ID generated from the Dashboard
      "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      "currency": "INR",
      "name": "Acme Corp", //your business name
      "description": "Test Transaction",
      "image": "https://example.com/your_logo",
      "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      "handler": function(response) {
         verifyPayment(response, order);
      },
      "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
          "name": "Gaurav Kumar", //your customer's name
          "email": "gaurav.kumar@example.com",
          "contact": "9000090000" //Provide the customer's phone number for better conversion rates 
      },
      "notes": {
          "address": "Razorpay Corporate Office"
      },
      "theme": {
          "color": "#3399cc"
      }
  };
  var rzp1 = new Razorpay(options);
       rzp1.open();
  }
  


  function verifyPayment(payment,order){
    const amount2 = document.getElementById("total").innerHTML;
    $.ajax({
      url:"/verifyPayment",
      method:"post",
      data:{
        payment: payment,
        amount2: amount2,
        order: order
      },
      success:(response)=>{
        if(response.success){
          swal.fire({
            positon: 'center',
            icon: "success",
            title: 'Order Placed Successfully',
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: "Go to Shop",
        }).then((result) => {
            if (result.dismiss === swal.DismissReason.cancel) {
              window.location.href = "/product";
            }
          });
        }else{
          swal.fire({
            positon: 'center',
            icon: "error",
            title: 'payment failed',
            showConfirmButton: false,
            timer:1500,
        })
        }
      }
    })
  }
