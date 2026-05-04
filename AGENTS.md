# Polymarkets market scanner

## Project overview

This project can be understood as a detailed presentation of the polymarkets active markets. Application fetches markets from polymarket's APIs and presents them with additional information such as trading signals that inform us when market's price moves significantly, there is high volume surge, market is near resolution etc. Signals are defined by rules in @lib/markets/rules.ts file.

Goal is to add more functionality to the app to improve decision making before making trades. Next steps are to add following:

### Market details

- live feed of trades made on that market sorted from newest to oldest by default with additional filtering and sorting functionality

## Technology stack

- **Next.js** fullstack framework
- **Tanstack react-query** for client-side fetching
- **Tanstack react-virtual** for client-side virtualization of long lists
- **Shadcn with RadixUI** for implementing user interface
- **Tailwind** for UI styling
- **Jotai** for state management
- **Lucide react** icon library

## Project structure

- **app**: This is where NextJS pages and route handlers go. Ideally only high-level structure and data fetching logic for SSR go here.
- **components**: React components for the app. UI components for reuse go in **components/ui**.
- **lib**: For utilities, types, data transformation logic, entities used across application, state management etc. Only _.ts_ files go here; exported entities should be commented with _tsdoc_.

## Development

- **strict _typescript_**: _unknown_ should be preferred to _any_, but generally everything should be typed
- **icons**: use icons from lucide-react library, avoid inline svg
- **formatting**: use formatting utility functions located in `lib/utils.ts` file
- **SOLID principles**: where possible, write reusable and maintanable code according to SOLID principles
- **Hooks**: Don't reinvent what's already available in `usehooks-ts` library
- **tsdoc**: Upon editing entitiy that's been documented with _tsdoc_, update documentation

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
