import React, { Component } from 'react';
import Aux from '../../hoc/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-order';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import Spinner from '../../components/UI/Spinner/Spinner';

const INGRIENDIENT_PRICE ={
    salad:0.5,
    meat:1.3,
    bacon:1.2,
    cheese:0.8
};

class BurgerBuilder extends Component {
    state = {
        ingredients :null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading:false,
        error:false
    };

    componentDidMount () {
        axios.get('https://my-burger-cbeae.firebaseio.com/Ingredients.json')
        .then(response => {
            console.log(response.data)
            this.setState({ingredients: response.data})
        })
        .catch(error => {
            this.setState({error:true})
        });
    }
    updatePurchase(ingredients){
        const sum = Object.keys(ingredients)
        .map(igKey => {
            return ingredients[igKey]
        })
        .reduce((sum, el)=>{
            return sum + el;
        },0);

        this.setState({purchasable : sum>0})
    }
    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type]
        const updatedCount = oldCount+1
        const updatedIngredients ={
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount
        const priceAddition=INGRIENDIENT_PRICE[type]
        const oldPrice =this.state.totalPrice
        const newPrice = oldPrice+priceAddition
        this.setState({ totalPrice:newPrice, ingredients:updatedIngredients });
        this.updatePurchase(updatedIngredients);
    }

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type]
        if (oldCount <= 0){
            return;
        }
        const updatedCount = oldCount - 1
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount
        const priceRemoved = INGRIENDIENT_PRICE[type]
        const oldPrice = this.state.totalPrice
        const newPrice = oldPrice - priceRemoved
        this.setState({totalPrice:newPrice, ingredients:updatedIngredients});
        this.updatePurchase(updatedIngredients);
    }

    purchaseHandler = () => {
        this.setState({purchasing: true})
    }

    purchaseCancelHandler = () => {
        this.setState({purchasing: false})
    }

    purchaseContinueHandler = () => {
        //alert('You Continued!')
        this.setState({loading:true})
        const order={
            ingredients:this.state.ingredients,
            price:this.state.totalPrice,
            customer:{
                name:'Savitri',
                address:{
                    street:'TestStreet 1',
                    country:'xyz'
                },
                email:'xyz@gmail.com'
            },
            deliveryMethod:'fastest'
        }
        axios.post('/orders.json',order)
        .then(response => {
            this.setState({loading:true,purchasing:false}) 
        })
            .catch(error => {
                this.setState({loading:true,purchasing:false})
        });
    }
    render() {

        const disabledInfo = {
            ...this.state.ingredients
        }
        for (let key in disabledInfo){
            disabledInfo[key] = disabledInfo[key] <= 0
        }

        let orderSummary= null;
        let burger = this.state.error ? <p>Ingredients can't be loaded!</p> : <Spinner/>

        if(this.state.ingredients) {
             burger = (
                <Aux>
                    <Burger ingredients={this.state.ingredients} />
                    <BuildControls
                    ingredientsAdded={this.addIngredientHandler} 
                    ingredientsRemoved={this.removeIngredientHandler}
                    disabled={disabledInfo}
                    ordered={this.purchaseHandler}
                    purchasable={this.state.purchasable}
                    price={this.state.totalPrice}/>
                </Aux>
            );
             orderSummary=<OrderSummary ingredients={this.state.ingredients}
                        purchaseCancelled={this.purchaseCancelHandler}
                        purchaseContinued={this.purchaseContinueHandler}
                        price={this.state.totalPrice}/>
        }

        if (this.state.loading){
            orderSummary=<Spinner/>
        }

        return(
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        );
    }
}

export default withErrorHandler(BurgerBuilder,axios);