import React, { useEffect, useState } from "react";
import MessageBox from "../components/MessageBox";
import PrevButton from "../components/PrevButton";
import { MoonLoader } from "react-spinners";

// 미션: Chat에서 ingredientList 데이터를 props로 받아서 콘솔에 찍어보기

const Chat = ({ ingredientList }) => {
  // logic
  // console.log("ingredientList", ingredientList);
  const endpoint = process.env.REACT_APP_SERVER_ADDRESS;

  const [value, setValue] = useState("");

  // TODO: set함수 추가하기
  const [messages, setMessages] = useState([]); // chatGPT와 사용자의 대화 메시지 배열

  const [infoMessages, setInfoMessages] = useState([]); // 초기 메시지 배열(system, user)
  const [isInfoLoading,setIsInfoLoading] = useState(true); // 최초 정보 요청시 로딩 전체페이지로딩
  const [isMessageLoading,setIsMessageLoading] = useState(false); // 사용자와 메시지 주고 받을때 로딩


  const hadleChange = (event) => {
    const { value } = event.target;
    // console.log("value==>", value);
    setValue(value);
  };

  const sendMessage = async (userMessage) => {
  setIsMessageLoading(true);
  try {
    const response = await fetch(`${endpoint}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userMessage,
        messages: [...infoMessages, ...messages],
      }),
    });

    const result = await response.json();

    // chatGPT의 답변 추가
    const { role, content } = result.data;
    const assistantMessage = { role, content };
    setMessages((prev) => [...prev, assistantMessage]);

    // console.log("🚀 ~ sendMessage ~ result:", result);

  } catch (error) {
    console.error(error);
  } finally {
    // try 혹은 error 구문 실행후 실행되는 곳
    setIsMessageLoading(false);
  }
};

const hadleSubmit = (event) => {
  event.preventDefault();
  // console.log("메시지 보내기");
 const userMessage = {
  role : "user",
  content : value.trim()
 }
  // console.log("🚀 ~ userMessage:", userMessage)
  
  //메시지 데이터 업데이트(유저 메시지 추가) 
  setMessages((prev)=>[...prev], userMessage)

  // 메시지 입력값 초기화
  setValue("");

  //메시지 API호출
  sendMessage(userMessage)
};

  //초기 세팅하는 API 호출 (실행되는 시점 - )
  const sendInfo = async (data)=>{
    setIsInfoLoading(true);
    try {
      //백엔드에 recipe 요청 응답 받는데 시간이 걸리기 때문에 비동기처리 해야 함
      const response = await fetch(`${endpoint}/recipe`,{method:"POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ingredientList: data })
    })


    // json -> 데이터형태인 객체로 변환
    const result = await response.json();
    // console.log("🚀 ~ sendInfo ~ result:", result);
    
    //데이터가 잘 들어오지 않은 경우 뒤에 코드 무시
    if(!result.data) return;

    //마지막 요소 제거된 메시지 배열
    const removeLastDataList = result.data.filter((_,index,array)=> array.length -1 !== index)

    //초기 메시지 배열에 저장
    setInfoMessages(removeLastDataList);

    // 첫 assistant답변 UI에 추가
    const { role, content } = result.data[result.data.length - 1];

    // prev: 배열
    setMessages((prev) => [...prev, { role, content }]);

  } catch (error) {
    console.error(error);
  }
  finally{
      setIsInfoLoading(false);
    }
  };


    useEffect(()=>{
      console.log("infoMessages",infoMessages )
  }, [infoMessages]);
  //페이지에 진입했을때 딱 한번 실행
  useEffect(()=>{
    sendInfo(ingredientList);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // view
  return (
    <div className="w-full h-full px-6 pt-10 break-keep overflow-auto">
      {isInfoLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MoonLoader color="#46A195" />
          </div>
        </div>
      )}

      {/* START: 로딩 스피너 */}
      {/* START:뒤로가기 버튼 */}
      <PrevButton />
      {/* END:뒤로가기 버튼 */}
      <div className="h-full flex flex-col">
        {/* START:헤더 영역 */}
        <div className="-mx-6 -mt-10 py-7 bg-chef-green-500">
          <span className="block text-xl text-center text-white">
            맛있는 쉐프
          </span>
        </div>
        {/* END:헤더 영역 */}
        {/* START:채팅 영역 */}
        <div className="overflow-auto">
          <MessageBox messages={messages} isLoading={isMessageLoading} />
        </div>
        {/* END:채팅 영역 */}
        {/* START:메시지 입력 영역 */}
        <div className="mt-auto flex py-5 -mx-2 border-t border-gray-100">
          <form
            id="sendForm"
            className="w-full px-2 h-full"
            onSubmit={hadleSubmit}
          >
            <input
              className="w-full text-sm px-3 py-2 h-full block rounded-xl bg-gray-100 focus:"
              type="text"
              name="message"
              value={value}
              onChange={hadleChange}
            />
          </form>
          <button
            type="submit"
            form="sendForm"
            className="w-10 min-w-10 h-10 inline-block rounded-full bg-chef-green-500 text-none px-2 bg-[url('../public/images/send.svg')] bg-no-repeat bg-center"
          >
            보내기
          </button>
        </div>
        {/* END:메시지 입력 영역 */}
      </div>
    </div>
  );
};

export default Chat;
