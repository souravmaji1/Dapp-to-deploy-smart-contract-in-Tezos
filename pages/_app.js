
import '../styles/globals.css';
import { ChakraProvider } from '@chakra-ui/react'
import { SaasProvider } from '@saas-ui/react'



function MyApp({ Component, pageProps }) {
	return (
		
			<ChakraProvider>
			<SaasProvider>
			<Component {...pageProps} />
			</SaasProvider>
			</ChakraProvider>
	);
}

export default MyApp;
