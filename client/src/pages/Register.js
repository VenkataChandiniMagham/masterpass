import React, { useContext, useState } from 'react';
import CryptoJS from 'crypto-js';
import { Button, Form } from 'semantic-ui-react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import { AuthContext } from '../context/auth';
import { useForm } from '../util/hooks';

function Register(props) {
	const context = useContext(AuthContext);
	const [errors, setErrors] = useState({});

	const { onChange, onSubmit, values } = useForm(registerUser, {
		username: '',
		password: '',
		confirmPassword: ''
	});

	const [addUser, { loading }] = useMutation(REGISTER_USER, {
		update(_, { data: { register: userData } }) {
			context.login(userData);
			const salt = userData._id.toString();
			const key256Bits = CryptoJS.PBKDF2(values.password, salt, {
				keySize: 256 / 32
			});
			sessionStorage.setItem('key', key256Bits);
			console.log(key256Bits);
			props.history.push('/');
		},
		onError(err) {
			setErrors(err.graphQLErrors[0].extensions.exception.errors);
		},
		variables: values
	});

	function registerUser() {
		addUser();
	}

	return (
		<div className='form-container'>
			<Form
				onSubmit={onSubmit}
				noValidate
				className={loading ? 'loading' : ''}
			>
				<h1>Register</h1>
				<Form.Input
					label='Username'
					placeholder='Username..'
					name='username'
					type='text'
					value={values.username}
					error={errors.username ? true : false}
					onChange={onChange}
				/>
				<Form.Input
					label='Password'
					placeholder='Password..'
					name='password'
					type='password'
					value={values.password}
					error={errors.password ? true : false}
					onChange={onChange}
				/>
				<Form.Input
					label='Confirm Password'
					placeholder='Confirm Password..'
					name='confirmPassword'
					type='password'
					value={values.confirmPassword}
					error={errors.confirmPassword ? true : false}
					onChange={onChange}
				/>
				<Button type='submit' primary>
					Register
				</Button>
			</Form>
			{Object.keys(errors).length > 0 && (
				<div className='ui error message'>
					<ul className='list'>
						{Object.values(errors).map(value => (
							<li key={value}>{value}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

const REGISTER_USER = gql`
	mutation register(
		$username: String!
		$password: String!
		$confirmPassword: String!
	) {
		register(
			registerInput: {
				username: $username
				password: $password
				confirmPassword: $confirmPassword
			}
		) {
			_id
			username
			token
		}
	}
`;

export default Register;